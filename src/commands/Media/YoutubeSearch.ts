/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'
import { YoutubeDataAPI } from 'youtube-v3-api'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class YoutubeSearch extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      name: 'yt',
      category: 'Media',
      description: 'Search Youtube videos',
      usage: ['yt <video to search for>'],
      args: true
    })
    this.color = '#FF3333'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { Utils, db, p } = client
    const { paginate, embed, missingConfig } = Utils
    // * ------------------ Config --------------------

    const { apiKey } = db.config.google
    const yt = new YoutubeDataAPI(apiKey)

    // * ------------------ Check Config --------------------

    if (!apiKey) {
      const settings = [`${p}config set google apiKey <key>`]
      return missingConfig(msg, 'google', settings)
    }

    // * ------------------ Logic --------------------
    const fetchVideos = async (searchTerm) => {
      const data = (await yt.searchAll(searchTerm, 25)) as any[]
      const results = []

      for (const i of data) {
        const { description, channelTitle, thumbnails } = i.snippet
        const { videoId } = i.id
        const { publishedAt, title } = i.snippet
        const thumbnail = thumbnails.high.url
        results.push(
          embed(msg, this.color, 'youtube.png')
            .setTitle(`YT - ${title}`)
            .setURL(`https://youtube.com/watch?v=${videoId})`)
            .addField('Channel', channelTitle, true)
            .addField('Published', publishedAt.toString().substring(0, 10), true)
            .addField('Description', description || 'No Description..')
            .setImage(thumbnail)
        )
      }
      return paginate(msg, results)
    }
    // * ------------------ Usage Logic --------------------
    return fetchVideos(args.join(' '))
  }
}
