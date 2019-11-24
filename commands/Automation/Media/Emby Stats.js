const urljoin = require('url-join')
const fetch = require('node-fetch')
const Command = require('../../../core/Command')

class EmbyStats extends Command {
  constructor(client) {
    super(client, {
      name: 'emby',
      category: 'Media',
      description: 'Gets library stats on Emby.',
      usage: 'emby streams | emby stats | emby recent <movies/series>',
      args: true,
      webUI: true
    })
  }

  async run(client, msg, args, api) {
    const { p, Utils } = client
    const { errorMessage, warningMessage, validOptions, standardMessage, missingConfig } = Utils
    const { apiKey, host, userID } = JSON.parse(client.settings.emby)
    if (!host || !apiKey || !userID) {
      const settings = [
        `${p}db set emby host <http://ip>`,
        `${p}db set emby apiKey <APIKEY>`,
        `${p}db set emby userID <USERID>`
      ]
      return missingConfig(msg, 'emby', settings)
    }

    const headers = { 'X-Emby-Token': apiKey }

    // post /Library/Refresh library scan

    const getLink = (item) => {
      var Id = item['Id']
      var serverId = item['ServerId']
      return urljoin(
        host,
        `/web/index.html#!/itemdetails.html?id=${Id}&context=tvshows&serverId=${serverId}`
      )
    }

    const fetchStats = async (endPoint) => {
      try {
        const response = await fetch(`${urljoin(host, endPoint)}`, { headers })

        switch (response.status) {
          case 200: {
            const json = await response.json()
            if (api) return json
            return json
          }
          case 401: {
            if (api) return 'Bad API key'
            return warningMessage(msg, 'Bad API key')
          }
          default:
            if (api) return 'Failed to connect'
            return errorMessage(msg, 'No connection to Emby')
        }
      } catch {
        if (api) return 'Failed to connect'
        return errorMessage(msg, 'No connection to Emby')
      }
    }

    let embed
    if (!api) {
      embed = Utils.embed(msg, 'green').setThumbnail(
        'https://emby.media/community/public/style_images/master/meta_image1.png'
      )
    }

    const caseOptions = ['streams', 'stats', 'recent']
    switch (args[0]) {
      case 'streams': {
        const nowPlaying = await fetchStats('/Sessions')

        let currentStreamCount = 0
        const currentStreams = []
        nowPlaying.forEach((i) => {
          if (i.NowPlayingItem) {
            currentStreamCount++
            currentStreams.push({
              user: Utils.capitalize(i.UserName),
              client: i.Client,
              device: i.DeviceName,
              item: i.NowPlayingItem.Name
            })
          }
        })

        if (api) return { currentStreamCount, currentStreams }

        if (!currentStreamCount) {
          return standardMessage(msg, 'Nothing is playing')
        }
        embed.setTitle(`Emby Stats - Current Streams [${currentStreamCount}]`)

        currentStreams.forEach((i) => {
          embed.addField(
            `\u200b`,
            `**Username**\n- ${i.user}\n**Client Type**\n- ${i.client}\n**Device Name**\n- ${i.device}\n**Playing Item**\n- ${i.item}\n\n`,
            true
          )
        })
        return msg.channel.send(embed)
      }

      case 'stats': {
        const stats = await fetchStats('/Items/Counts')

        const { MovieCount, SeriesCount, EpisodeCount, ArtistCount, SongCount, BookCount } = stats
        return msg.channel.send(
          embed
            .setTitle('Emby Stats')
            .addField(':film_frames: Movies', MovieCount, true)
            .addField(':dvd: Series', SeriesCount, true)
            .addField(':desktop: Episodes', EpisodeCount, true)
            .addField(':microphone2:  Artists', ArtistCount, true)
            .addField(':musical_note: Songs', SongCount, true)
            .addField(':blue_book: Books', BookCount, true)
        )
      }
      case 'recent': {
        const caseOptions = ['series', 'movies']

        const mediaType = args[1] === 'movies' ? 'Movie' : args[1] === 'series' ? 'Episode' : ''

        const endpoint = `/Users/${userID}/Items/Latest`
        const params = `?IncludeItemTypes=${mediaType}&Limit=10&IsPlayed=false&GroupItems=false`
        const stats = await fetchStats(endpoint + params)

        switch (args[1]) {
          case 'movies': {
            embed.setTitle('Recently added movies')
            let text = ''
            stats.forEach((key, index) => {
              text += `${index + 1}. [LINK](${getLink(key)}) - ${key.Name}\n`
            })
            embed.setDescription(text)
            return msg.channel.send(embed)
          }
          case 'series': {
            embed.setTitle('Recently added series')
            stats.forEach((key) => {
              embed.addField(`${key.SeriesName}`, `- ${key.Name}\n- [Link](${getLink(key)})`, true)
            })
            return msg.channel.send(embed)
          }
          default:
            return validOptions(msg, caseOptions)
        }
      }

      default: {
        return validOptions(msg, caseOptions)
      }
    }
  }
}
module.exports = EmbyStats
