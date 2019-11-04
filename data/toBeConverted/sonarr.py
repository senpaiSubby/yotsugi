# _____  _              _       _____       _    _  _
# |   __||_| _____  ___ | | _ _ |   __| _ _ | |_ | ||_| _____  ___
# |__   || ||     || . || || | ||__   || | || . || || ||     || -_|
# |_____||_||_|_|_||  _||_||_  ||_____||___||___||_||_||_|_|_||___|
#                 |_|     |___|

import asyncio
import json
import operator  # to sort a list of instances
from typing import Optional
from dataclasses import dataclass
import discord
import requests
from dacite import from_dict  # convert dictionaries to dataclass instances
from discord.ext import commands

#! ----------------------------- Sonarr Settings -----------------------------

apiKey = ""
url = "https://sonarr.atriox.io"
sortingMode = "year"
profile = 6
monitored = True
autosearch = True
seasonfolder = True


#! ----------------------------- dataclass for results -----------------------------


@dataclass
class Series:
    title: str
    year: int
    tvdbId: int
    rating: float
    overview: Optional[str]
    poster: Optional[str]


#! ----------------------------- Search series -----------------------------


def searchSeries(searchTerm):
    """searches for movie via search term"""
    searchTerm = searchTerm.replace(" ", "%20")
    sonarr = requests.get(
        url + "/api/series/lookup/?term=" + searchTerm + "&apikey=" + apiKey
    )
    results = sonarr.json()
    return cleaup(results)


#! ----------------------------- clean/create instances -----------------------------


def cleaup(results_json):
    """cleans results from searchSeries() and returns a list of instances for Series class"""
    instances = []
    for i in results_json:
        if "overview" not in i or "remotePoster" not in i:
            pass
        else:
            results = {
                "title": i["title"],
                "year": i["year"],
                "tvdbId": i["tvdbId"],
                "rating": i["ratings"]["value"],
                "overview": i["overview"],
                "poster": i["remotePoster"],
            }

            instances.append(from_dict(data_class=Series, data=results))
    instances = sorted(instances, key=operator.attrgetter(
        sortingMode), reverse=True)

    return instances


#! ----------------------------- add series -----------------------------


def addSeries(tvdbId, seriesType):
    """adds series to sonarr via tvmb id and the series type"""
    result = requests.get(
        url + "/api/series/lookup?term=tvdbId:" +
        str(tvdbId) + "&apikey=" + apiKey
    )
    result = result.json()

    post_data = {
        "qualityProfileId": profile,
        "rootFolderPath": "/data/media/tv/series/",
        "seriesType": seriesType,
        "monitored": monitored,
        "seasonFolder": seasonfolder,
        "addOptions": {"searchForMissingEpisodes": autosearch},
    }

    for dictkey in ["tvdbId", "title", "titleSlug", "images", "year", "seasons"]:
        post_data.update({dictkey: result[0][dictkey]})

    status = requests.post(url + "/api/series?apikey=" +
                           str(apiKey), json=post_data)
    status = status.status_code

    """
    400 = exists
    201 = added
    404 = no route
    """
    return status


#! ----------------------------- Cog -----------------------------


class Sonarr(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=["series", "tv", "anime", "show"])
    @commands.guild_only()
    async def sonarr(self, ctx, *, search_term):
        async with ctx.channel.typing():
            # dont respond to ourselves
            if ctx.message.author.id == 596795735341662228:
                pass
            else:
                # delete the initial user message
                await ctx.message.delete()

                # search for the show and get json results
                results = searchSeries(search_term)
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
                        poster = results[page].poster
                        show_id = results[page].tvdbId
                        overview = results[page].overview
                        year = results[page].year

                        embed = discord.Embed(
                            title=f"{title} ({year})",
                            color=0xD79921,
                            timestamp=ctx.message.created_at,
                        )
                        embed.set_thumbnail(url=poster)
                        embed.add_field(name="Overview",
                                        value=overview, inline=False)
                        embed.add_field(
                            name="TV Database ID", value=show_id, inline=False
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

                        if page + 1 == amount_of_results and first == True:
                            emojis = ["✅", "🍙", "🛑"]  # check/rice/stop

                        elif page == 0:
                            emojis = ["✅", "🍙", "⏭", "🛑"] # check/rice/next/stop
                        elif page + 1 == amount_of_results:
                            emojis = ["✅", "🍙", "⏮", "🛑"]
                        else:
                            emojis = ["✅", "🍙", "⏮", "⏭", "🛑"]  # check/rice/back/next/stop

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

                            if (
                                reaction.emoji == "✅" or reaction.emoji == "🍙"
                            ):  # check mark emoji/rice ball
                                if reaction.emoji == "🍙":
                                    seriesType = "anime"
                                else:
                                    seriesType = "standard"

                                status = addSeries(
                                    results[page].tvdbId, seriesType)

                                if status == 400:

                                    embed = discord.Embed(
                                        title=f":hourglass_flowing_sand: The series: ***{title}***, has already been added to the queue. It'll be downloaded soon.",
                                        color=0xCC241D,
                                        timestamp=ctx.message.created_at,
                                    )

                                    await ctx.send(embed=embed)

                                elif status == 201:
                                    embed = discord.Embed(
                                        title=f":tv:  ***{title}*** has been added to the download queue.",
                                        color=0xA2BA00,
                                        timestamp=ctx.message.created_at,
                                    )
                                    await ctx.send(embed=embed)
                                elif status == 404:
                                    await ctx.send(f"Sonarr could not be reached.")

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

    @sonarr.error
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
    bot.add_cog(Sonarr(bot))
