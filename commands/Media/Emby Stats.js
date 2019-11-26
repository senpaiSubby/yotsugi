const urljoin = require('url-join')
const fetch = require('node-fetch')
const Command = require('../../core/Command')

class EmbyStats extends Command {
  constructor(client) {
    super(client, {
      name: 'emby',
      category: 'Media',
      description: 'Gets library stats on Emby.',
      usage: ['emby streams', 'emby stats', 'emby recent <movies/series>'],
      args: true,
      webUI: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { p, Utils, Log } = client
    const {
      errorMessage,
      warningMessage,
      validOptions,
      standardMessage,
      missingConfig,
      embed,
      capitalize
    } = Utils

    // * ------------------ Config --------------------

    const { apiKey, host, userID } = JSON.parse(client.db.general.emby)

    // * ------------------ Check Config --------------------

    if (!host || !apiKey || !userID) {
      const settings = [
        `${p}db set emby host <http://ip>`,
        `${p}db set emby apiKey <APIKEY>`,
        `${p}db set emby userID <USERID>`
      ]
      return missingConfig(msg, 'emby', settings)
    }
    const headers = { 'X-Emby-Token': apiKey }

    // * ------------------ Logic --------------------

    const getLink = (item) => {
      const { Id, serverId } = item
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
            return json
          }
          case 401: {
            const text = 'Bad API key'
            if (api) return text
            await warningMessage(msg, text)
            Log.error('Emby', text)
            break
          }
          default: {
            const text = 'Failed to connect to Emby'
            if (api) return text
            Log.error('Emby', text)
            await errorMessage(msg, text)
          }
        }
      } catch (e) {
        const text = 'Failed to connect to Emby'
        if (api) return text
        Log.error('Emby', text)
        await errorMessage(msg, text)
      }
    }

    // * ------------------ Usage Logic --------------------

    let e
    if (!api) {
      e = embed(msg).setThumbnail(
        'https://emby.media/community/public/style_images/master/meta_image1.png'
      )
    }

    switch (args[0]) {
      case 'streams': {
        const nowPlaying = await fetchStats('/Sessions')

        if (nowPlaying) {
          let currentStreamCount = 0
          const currentStreams = []
          nowPlaying.forEach((i) => {
            if (i.NowPlayingItem) {
              currentStreamCount++
              currentStreams.push({
                user: capitalize(i.UserName),
                client: i.Client,
                device: i.DeviceName,
                item: i.NowPlayingItem.Name
              })
            }
          })

          if (api) return { currentStreamCount, currentStreams }

          if (!currentStreamCount) return standardMessage(msg, 'Nothing is playing')

          e.setTitle(`Emby Stats - Current Streams [${currentStreamCount}]`)

          currentStreams.forEach((i) => {
            e.addField(
              `\u200b`,
              `**Username**\n- ${i.user}\n**Client Type**\n- ${i.client}\n**Device Name**\n- ${i.device}\n**Playing Item**\n- ${i.item}\n`,
              true
            )
          })
          return msg.channel.send(e)
        }
        return
      }

      case 'stats': {
        const stats = await fetchStats('/Items/Counts')
        if (stats) {
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
        return
      }
      case 'recent': {
        const mediaType = args[1] === 'movies' ? 'Movie' : args[1] === 'series' ? 'Episode' : ''

        const endpoint = `/Users/${userID}/Items/Latest`
        const params = `?IncludeItemTypes=${mediaType}&Limit=10&IsPlayed=false&GroupItems=false`
        const stats = await fetchStats(endpoint + params)

        if (stats) {
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
                embed.addField(
                  `${key.SeriesName}`,
                  `- ${key.Name}\n- [Link](${getLink(key)})`,
                  true
                )
              })
              return msg.channel.send(embed)
            }
            default:
              return validOptions(msg, ['series', 'movies'])
          }
        }

        return
      }

      default: {
        return validOptions(msg, ['streams', 'stats', 'recent'])
      }
    }
  }
}
module.exports = EmbyStats
