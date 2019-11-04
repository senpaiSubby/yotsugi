# _____  _              _       _____       _    _  _
# |   __||_| _____  ___ | | _ _ |   __| _ _ | |_ | ||_| _____  ___
# |__   || ||     || . || || | ||__   || | || . || || ||     || -_|
# |_____||_||_|_|_||  _||_||_  ||_____||___||___||_||_||_|_|_||___|
#                 |_|     |___|

import asyncio
import json
import operator
from dataclasses import dataclass
from typing import Optional

import discord
import requests
from dacite import from_dict
from discord.ext import commands

apiKey = ""
url = "https://radarr.atriox.io"
sortingMode = "year"
profile = 6
monitored = True
autosearch = True


@dataclass
class Series:
    title: str
    year: int
    tmdbId: int
    rating: float
    overview: Optional[str]
    poster: Optional[str]


#! ----------------------------- Search Movie -----------------------------


def searchMovie(searchterm):

    # Replace spaces from search term
    searchterm = searchterm.replace(" ", "%20")
    # Makes API request and return data
    radarr = requests.get(
        url + "/api/movie/lookup/?term=" + searchterm + "&apikey=" + str(apiKey)
    )
    results = radarr.json()

    return cleaup(results)
    # print(results)


def cleaup(results_json):
    instances = []
    for i in results_json:
        if "overview" not in i or "remotePoster" not in i:
            pass
        else:
            results = {
                "title": i["title"],
                "year": i["year"],
                "tmdbId": i["tmdbId"],
                "rating": i["ratings"]["value"],
                "overview": i["overview"],
                "poster": i["remotePoster"],
            }

            instances.append(from_dict(data_class=Series, data=results))
    instances = sorted(instances, key=operator.attrgetter(sortingMode), reverse=True)

    return instances


def checkExists(value):
    url = "https://radarr.atriox.io"
    apiKey = "22833f986d5543ce94ea197a1d21dfb8"
    key = "tmdbId"
    lst = requests.get(url + "/api/movie?apikey=" + str(apiKey))
    lst = lst.json()

    for i, dic in enumerate(lst):
        if dic[key] == int(value):
            return i

    return -1


#! ----------------------------- Add Movie -----------------------------


def addMovie(tmdbId):
    result = requests.get(
        url + "/api/movie/lookup/tmdb?tmdbId=" + str(tmdbId) + "&apikey=" + str(apiKey)
    )
    result = result.json()

    post_data = {
        "qualityProfileId": profile,
        "rootFolderPath": "/data/media/movies/",
        "monitored": monitored,
        "addOptions": {"searchForMovie": autosearch},
    }

    for dictkey in ["tmdbId", "title", "titleSlug", "images", "year"]:
        post_data.update({dictkey: result[dictkey]})

    status = requests.post(url + "/api/movie?apikey=" + str(apiKey), json=post_data)
    status = status.status_code

    """
    400 = exists
    201 = added
    404 = no route
    """
    return status


#! ----------------------------- Cog -----------------------------


class Radarr(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=["movie", "searchmovie"])
    @commands.guild_only()
    async def radarr(self, ctx, *, search_term):
        # async with ctx.channel.typing():
        # dont respond to ourselves
        if ctx.message.author.id == 596795735341662228:
            pass
        else:
            # delete the initial user message
            await ctx.message.delete()

            # search for the movie and get json results
            results = searchMovie(search_term)
            amount_of_results = len(results)

            # if there are no results alert the user
            if not results:
                await ctx.send(
                    f"There were no results for ***{search_term}*** {ctx.author.mention}",
                    delete_after=5.0,
                )
                await ctx.message.delete()

            else:
                # function variables to keep track of the page
                done = False
                page = 0
                first = True

                while done is False:

                    title = results[page].title
                    year = results[page].year
                    poster = results[page].poster
                    movie_id = results[page].tmdbId
                    overview = results[page].overview

                    embed = discord.Embed(
                        title=f"{title} ({year})",
                        color=0xD79921,
                        timestamp=ctx.message.created_at,
                    )
                    embed.set_thumbnail(url=poster)
                    embed.add_field(name="Overview", value=overview, inline=False)
                    embed.add_field(
                        name="Movie Database ID", value=movie_id, inline=False
                    )
                    embed.add_field(
                        name="Results",
                        value=f"Page {page + 1}/{amount_of_results}",
                        inline=False,
                    )
                    embed.set_footer(
                        text=f"Requested by {ctx.author}",
                        icon_url=ctx.author.avatar_url,
                    )

                    if page == 0 and first is True:
                        msg = await ctx.send(embed=embed)

                    else:
                        await msg.edit(embed=embed)
                        await msg.clear_reactions()

                    if page == 0:
                        emojis = ["✅", "⏭", "🛑"]  # stop sign
                    elif page + 1 == amount_of_results:
                        emojis = ["✅", "⏮", "🛑"]  # stop sign
                    else:
                        emojis = ["✅", "⏮", "⏭", "🛑"]  # stop sign

                    for i in emojis:
                        await msg.add_reaction(i)

                    # get the reaction clicked by the user
                    def check(reaction, user):
                        """get the reaction clicked by the user"""
                        return user == ctx.message.author and str(reaction.emoji)

                    try:
                        reaction, user = await self.bot.wait_for(
                            "reaction_add", timeout=45.0, check=check
                        )

                        if reaction.emoji == "✅":  # check mark emoji
                            exists = checkExists(movie_id)

                            if exists is not -1:
                                embed = discord.Embed(
                                    title=f":checkered_flag: The movie: ***{title}***, is already available to watch",
                                    color=0xA2BA00,
                                    timestamp=ctx.message.created_at,
                                )
                                await ctx.send(embed=embed)
                                done = True
                            else:
                                status = addMovie(movie_id)

                                if status == 400:

                                    embed = discord.Embed(
                                        title=f":hourglass_flowing_sand: The movie: ***{title}***, has already been added to the queue. It'll be downloaded soon.",
                                        color=0xCC241D,
                                        timestamp=ctx.message.created_at,
                                    )

                                    await ctx.send(embed=embed)

                                elif status == 201:
                                    embed = discord.Embed(
                                        title=f":movie_camera: ***{title}*** has been added to the download queue.",
                                        color=0xA2BA00,
                                        timestamp=ctx.message.created_at,
                                    )
                                    await ctx.send(embed=embed)
                                elif status == 404:
                                    await ctx.send(f"Radarr could not be reached.")

                                else:
                                    await ctx.send("Tell Sublime to fix his shit.")

                                done = True

                        elif reaction.emoji == "⏭":
                            page += 1
                            first = False
                            pass

                        elif reaction.emoji == "⏮":
                            page -= 1
                            pass

                        elif reaction.emoji == "🛑":  # stop sign
                            done = True
                            await msg.delete()
                            await ctx.send(f"***CANCELED***", delete_after=3.0)
                        else:
                            break
                    except asyncio.TimeoutError:
                        await msg.delete()
                        await ctx.send("You didnt pick anything", delete_after=3.0)
                        break

    @radarr.error
    async def img_error(self, ctx, error):
        async with ctx.channel.typing():
            if isinstance(error, commands.MissingRequiredArgument):
                await ctx.message.delete()
                embed = discord.Embed(
                    title=f"Please specify the movie to search for.",
                    colour=discord.Colour.red(),
                )
                await ctx.send(embed=embed, delete_after=10.0)


def setup(bot):
    bot.add_cog(Radarr(bot))
