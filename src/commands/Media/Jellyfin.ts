/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { RichEmbed } from 'discord.js'
import { NezukoMessage } from 'typings'
import { get } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Emby extends Command {
  public color: string

  constructor(client: NezukoClient) {
    super(client, {
      name: 'jf',
      category: 'Media',
      description: 'Jellyfin media info',
      usage: ['jf streams', 'jf stats', 'jf recent <movies/series>'],
      args: true,
      webUI: true
    })
    this.color = '#9B62C5'
  }

  public async run(
    client: NezukoClient,
    msg: NezukoMessage,
    args: any[],
    api: boolean
  ) {
    // * ------------------ Setup --------------------

    const { p, Utils, Log } = client
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

    const { apiKey, host, userID } = client.db.config.jellyfin

    // * ------------------ Check Config --------------------

    if (!host || !apiKey || !userID) {
      const settings = [
        `${p}config set jellyfin host <http://ip>`,
        `${p}config set jellyfin apiKey <APIKEY>`,
        `${p}config set jellyfin userID <USERID>`
      ]
      return missingConfig(msg, 'jellyfin', settings)
    }
    const headers = { 'X-Emby-Token': apiKey, accept: 'application/json' }

    // * ------------------ Logic --------------------

    const getLink = (item) => {
      const { Id, serverId } = item
      return urljoin(
        host,
        `/web/index.html#!/itemdetails.html?id=${Id}&context=tvshows&serverId=${serverId}`
      )
    }

    const getImage = (item) => {
      const mediaType = item.Type
      // Console.log(mediaType)
      if (mediaType === 'Episode') {
        const seriesId = item.SeriesId
        return urljoin(host, 'jellyfin/Items/', seriesId, '/images/Primary')
      }

      const Id = item.Id
      return urljoin(host, 'jellyfin/Items/', Id, '/images/Primary')
    }

    const getOverview = async (item) => {
      const ID = item.Id

      const response = await get(
        `${urljoin(host, 'jellyfin', `Users/${userID}/Items/${ID}`)}`
      ).headers(headers)

      const data = response.body

      if (data.Overview) return (data.Overview as string).substring(0, 1024)
    }

    const fetchData = async (endPoint: string) => {
      try {
        const response = await get(
          `${urljoin(host, 'jellyfin', endPoint)}`
        ).headers(headers)

        switch (response.status) {
          case 200: {
            return response.body
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

    let e: RichEmbed
    if (!api)
      e = embed(msg, this.color).setThumbnail(
        'https://apps.jellyfin.org/chromecast/img/logo.png'
      )

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

          if (api) return { currentStreamCount, currentStreams }

          if (!currentStreamCount)
            return standardMessage(msg, this.color, 'Nothing is playing')

          e.setTitle(
            `Jellyfin Stats - Current Streams [ ${currentStreamCount} ]`
          )

          currentStreams.forEach((i) => {
            e.addField(
              `\u200b`,
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
          const {
            MovieCount,
            SeriesCount,
            EpisodeCount,
            ArtistCount,
            SongCount,
            BookCount
          } = stats
          return channel.send(
            embed(msg, this.color)
              .setThumbnail('https://apps.jellyfin.org/chromecast/img/logo.png')
              .setTitle('Jellyfin Stats')
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
        const mediaType =
          args[1] === 'movies' ? 'Movie' : args[1] === 'series' ? 'Episode' : ''

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
                  .setTitle(`Jellyfin Recent - Movies`)
                  .setThumbnail(getImage(item))
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
                  .setTitle(`Jellyfin Recent - Series`)
                  .setThumbnail(getImage(item))
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
