const urljoin = require('url-join')
const fetch = require('node-fetch')
const Command = require('../../../core/Command')

class EmbyStats extends Command {
  constructor(client) {
    super(client, {
      name: 'emby',
      category: 'Media',
      description: 'Gets library stats on Emby.',
      usage: 'emby streams | emby stats',
      args: true,
      webUI: true
    })
  }

  async run(client, msg, args, api) {
    const { Utils } = client
    const { apiKey, host } = JSON.parse(client.settings.emby)

    const headers = { 'X-Emby-Token': apiKey }

    // post /Library/Refresh library scan

    const fetchStats = async (endPoint) => {
      const response = await fetch(`${urljoin(host, endPoint)}`, { headers })

      switch (response.status) {
        case 200: {
          const json = await response.json()
          if (api) return json
          return json
        }
        case 401: {
          if (api) return 'Bad API key'
          const m = await msg.channel.send(Utils.embed(msg, 'red').setDescription('Bad API key'))
          m.delete(10000)
          break
        }
        default: {
          if (api) return 'Failed to connect'
          const m = await msg.channel.send(
            Utils.embed(msg, 'red').setDescription('Failed to connect to Emby')
          )
          m.delete(10000)
          break
        }
      }
    }

    const stats = await fetchStats('/Items/Counts')
    const nowPlaying = await fetchStats('/Sessions')

    if (stats && nowPlaying) {
      switch (args[0]) {
        case 'streams': {
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
          const embed = Utils.embed(msg)
            .setTitle(`Emby Stats - Current Streams [${currentStreamCount}]`)
            .setThumbnail('https://emby.media/community/public/style_images/master/meta_image1.png')
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
          const { MovieCount, SeriesCount, EpisodeCount, ArtistCount, SongCount, BookCount } = stats
          return msg.channel.send(
            Utils.embed(msg)
              .setTitle('Emby Stats')
              .setThumbnail(
                'https://emby.media/community/public/style_images/master/meta_image1.png'
              )
              .addField(':film_frames: Movies', MovieCount, true)
              .addField(':dvd: Series', SeriesCount, true)
              .addField(':desktop: Episodes', EpisodeCount, true)
              .addField(':microphone2:  Artists', ArtistCount, true)
              .addField(':musical_note: Songs', SongCount, true)
              .addField(':blue_book: Books', BookCount, true)
          )
        }
        default: {
          const m = await msg.channel.reply(
            Utils.embed(msg, 'yellow').setDescription('Valid params are [streams] || [stats]')
          )
          return m.delete(10000)
        }
      }
    }
  }
}
module.exports = EmbyStats
