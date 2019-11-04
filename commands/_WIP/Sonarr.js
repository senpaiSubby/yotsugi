const Discord = require('discord.js')
const urljoin = require('url-join')
const fetch = require('node-fetch')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'tv',
    category: 'Media',
    description: 'Add shows to Sonarr.',
    usage: `${prefix}tv <series name>`,
    aliases: ['sonarr']
  },
  options: {
    enabled: true,
    apiEnabled: false,
    showInHelp: true,
    ownerOnly: true,
    guildOnly: true,
    args: false,
    cooldown: 5
  },
  async execute (client, msg, args, api) {
    //* -------------------------- Setup --------------------------
    const { sortByKey } = client.utils

    //* ------------------------- Config --------------------------
    const {
      host,
      apiKey,
      profile,
      monitored,
      autosearch,
      seasonfolder,
      seriesPath,
      animePath
    } = client.config.commands.sonarr

    //* ----------------------- Main Logic ------------------------

    const searchSeries = async (searchTerm) => {
      try {
        const response = await fetch(
          urljoin(host, `/api/series/lookup/?term=${searchTerm}&apikey=${apiKey}`)
        )
        const data = await response.json()
        const results = []
        for (const i of data) {
          if ('overview' in i && 'remotePoster' in i) {
            results.push({
              title: i.title,
              year: i.year,
              tvdbId: i.tvdbId,
              rating: i.ratings.value,
              overview: i.overview,
              poster: i.remotePoster
            })
          }
        }
        return sortByKey(results, 'year')
      } catch (error) {
        return msg.channel.send('Error communicating with Sonarr')
      }
    }

    const addSeries = async (tvdbId, seriesType = 'standard') => {
      try {
        const response = await fetch(
          urljoin(host, `/api/seris/lookup?term=tvdbId:${tvdbId}&apikey=${apiKey}`)
        )
        const result = await response.json()
        const postData = {
          qualityProfileId: profile,
          rootFolderPath: seriesType === 'standard' ? seriesPath : animePath,
          seriesType: seriesType,
          monitored: monitored,
          seasonFolder: seasonfolder,
          addOptions: { searchForMissingEpisodes: autosearch },
          tvdbId: result[0].tvdbId,
          title: result[0].title,
          titleSlug: result[0].titleSlug,
          images: result[0].images,
          year: result[0].year,
          seasons: result[0].seasons
        }

        const status = await fetch(urljoin(host, `/api/series?apikey=${apiKey}`), {
          method: 'POST',
          body: JSON.stringify(postData)
        })
        return status.status
      } catch {
        return msg.channel.send('Error communicating with Sonarr')
      }
    }
    //* ---------------------- Usage Logic ------------------------
    const embed = new Discord.RichEmbed()
    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }
    const searchTerm = args.join(' ')

    const results = await searchSeries(searchTerm)
    const amountOfResults = results.length

    if (!amountOfResults) {
      return msg.channel.send(`There were no results for: ${searchTerm}`)
    } else {
      const done = false
      const page = 0
      const first = true
      let message

      while (!done) {
        const { title, poster, tvdbId, overview, year } = results[page]
        embed.setTitle(`${title} (${year})`)
        embed.setThumbnail(poster)
        embed.addField('Overview', overview)
        embed.addField('TVDB ID', tvdbId)
        embed.addField('Results', `Page ${page + 1}/${amountOfResults}`)

        // if (page === 0 && first) {
        // message = msg.channel.send({ embed })
        // } else {
        // message.edit({ embed })
        // message.clearReactions()
        // message.react('👍').then(() => message.react('👎'))

        // message = msg.channel.send({ embed })
        message = msg.msg.channel.send('test message')
        const filter = (reaction, user) => reaction.emoji.name === ':ok_hand:' // whatever emote you want to use, beware that .await.Reactions can only check a singel emote
        await message.then((m) => {
          m.awaitReactions(filter, { max: 1 })
            .then((collected) => {
              console.log('do what ever')
              m.delete() // such as this
            })
            .catch(console.error)
        })
        // }
        break
      }
    }
  }
}
