/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { MessageEmbed } from 'discord.js'
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { get } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to get information from Emby media server
 */
export default class Emby extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Media',
      description: 'Emby media server info and stats',
      name: 'emby',
      usage: ['emby streams', 'emby stats', 'emby recent [movies/series]'],
      webUI: true
    })
    this.color = '#52B54B'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { p } = client
    const { channel } = msg
    const {
      errorMessage,
      warningMessage,
      validOptions,
      standardMessage,
      missingConfig,
      embed,
      capitalize,
      paginate
    } = Utils

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { apiKey, host, userID } = config.emby

    // * ------------------ Check Config --------------------

    if (!host || !apiKey || !userID) {
      const settings = [
        `${p}config set emby host <http://ip>`,
        `${p}config set emby apiKey <APIKEY>`,
        `${p}config set emby userID <USERID>`
      ]
      return missingConfig(msg, 'emby', settings)
    }
    const headers = { 'X-Emby-Token': apiKey, accept: 'application/json' }

    // * ------------------ Logic --------------------

    const getLink = (item) => {
      const { Id, serverId } = item
      return urljoin(host, `/web/index.html#!/itemdetails.html?id=${Id}&context=tvshows&serverId=${serverId}`)
    }

    const getImage = (item) => {
      const mediaType = item.Type
      if (mediaType === 'Episode') {
        const seriesId = item.SeriesId
        return urljoin(host, 'Items/', seriesId, '/images/Primary')
      }

      const Id = item.Id
      return urljoin(host, 'Items/', Id, '/images/Primary')
    }

    const getOverview = async (item) => {
      const ID = item.Id

      const response = await get(`${urljoin(host, `Users/${userID}/Items/${ID}`)}`).headers(headers)

      const data = response.body

      if (data.Overview) return (data.Overview as string).substring(0, 1024)
    }

    const fetchData = async (endPoint: string) => {
      try {
        const response = await get(`${urljoin(host, endPoint)}`).headers(headers)

        switch (response.status) {
          case 200: {
            return response.body
          }
          case 401: {
            const text = 'Bad API key'
            await warningMessage(msg, text)
            Log.error('Emby', text)
            break
          }
          default: {
            const text = 'Failed to connect to Emby'
            Log.error('Emby', text)
            await errorMessage(msg, text)
          }
        }
      } catch (e) {
        const text = 'Failed to connect to Emby'
        Log.error('Emby', text)
        await errorMessage(msg, text)
      }
    }

    // * ------------------ Usage Logic --------------------

    let e: MessageEmbed

    switch (args[0]) {
      case 'streams': {
        const nowPlaying = (await fetchData('/Sessions')) as NowPlaying[]

        interface FormattedNowPlaying {
          user: string
          client: string
          device: string
          item: string
        }

        if (nowPlaying) {
          let currentStreamCount = 0
          const currentStreams: FormattedNowPlaying[] = []

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

          if (!currentStreamCount) {
            return standardMessage(msg, this.color, 'Nothing is playing')
          }

          e.setTitle(`Emby Stats - Current Streams [ ${currentStreamCount} ]`).setThumbnail(
            'https://emby.media/community/public/style_images/master/meta_image1.png'
          )

          currentStreams.forEach((i) => {
            e.addField(
              '\u200b',
              `**Username**
              - ${i.user}
              **Client Type**
              - ${i.client}
              **Device Name**
              - ${i.device}
              **Playing Item**
              - ${i.item}\n`,
              true
            )
          })
          return channel.send(e)
        }
        return
      }

      case 'stats': {
        const stats = (await fetchData('/Items/Counts')) as EmbyStats
        if (stats) {
          const { MovieCount, SeriesCount, EpisodeCount, ArtistCount, SongCount, BookCount } = stats
          return channel.send(
            embed(msg, this.color)
              .setThumbnail('https://emby.media/community/public/style_images/master/meta_image1.png')
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
      // TODO add typing for emby recent
      case 'recent': {
        const mediaType = args[1] === 'movies' ? 'Movie' : args[1] === 'series' ? 'Episode' : ''

        const endpoint = `/Users/${userID}/Items/Latest`
        const params = `?IncludeItemTypes=${mediaType}&Limit=10&IsPlayed=false&GroupItems=false`
        const stats = await fetchData(endpoint + params)

        if (stats) {
          switch (args[1]) {
            case 'movie':
            case 'movies': {
              const embedList = []

              for (const item of stats) {
                const overview = await getOverview(item)

                const { Name } = item

                const re = embed(msg, this.color)
                  .setURL(getLink(item))
                  .setTitle('Emby Recent - Movies')
                  .setThumbnail(
                    getImage(item) || 'https://emby.media/community/public/style_images/master/meta_image1.png'
                  )
                  .addField('Movie', Name, true)

                if (overview) re.addField('Description', overview)
                embedList.push(re)
              }
              return paginate(msg, embedList)
            }
            case 'tv':
            case 'series': {
              const embedList = []

              for (const item of stats) {
                const overview = await getOverview(item)

                const { SeriesName, Name } = item

                const re = embed(msg, this.color)
                  .setURL(getLink(item))
                  .setTitle('Emby Recent - Series')
                  .setThumbnail(
                    getImage(item) || 'https://emby.media/community/public/style_images/master/meta_image1.png'
                  )
                  .addField('Series', SeriesName, true)
                  .addField('Episode', Name, true)

                if (overview) re.addField('Description', overview)
                embedList.push(re)
              }
              return paginate(msg, embedList)
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
