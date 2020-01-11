/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoClient } from 'core/NezukoClient'
import { NezukoMessage } from 'typings'
import { get } from 'unirest'

import { Command } from '../../core/base/Command'

export default class Reddit extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'reddit',
      category: 'General',
      description: 'Search reddit',
      usage: ['reddit <subreddit>'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api: boolean) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { embed, warningMessage, errorMessage } = Utils
    const { channel } = msg

    // * ------------------ Usage Logic --------------------

    if (!args[0]) return errorMessage(msg, 'Please specify the sub reddit to grab from')

    const response = await get(`https://www.reddit.com/r/${args[0]}.json?sort=top=week`)
    const post = response.body.data.children

    if (!post) return warningMessage(msg, 'It seems no posts were found!, Try again later.')

    const randomnumber = Math.floor(Math.random() * post.length)
    const selectedPost = post[randomnumber].data

    const { url, subreddit_name_prefixed, author, title, selftext } = selectedPost

    let isImage = false

    const e = embed(msg, '#FF3F18')
      .setTitle(title)
      .addField('SubReddit', subreddit_name_prefixed, true)
      .addField('Author', author, true)
      .setURL(url)

    if (selftext) e.setDescription(selftext)

    const imageExtension = ['.png', '.jpg', '.gif']
    imageExtension.forEach((ext) => {
      if ((url as string).endsWith(ext)) {
        e.setImage(url)
        isImage = true
      }
    })

    if (!isImage) {
      e.setThumbnail(
        'https://external-preview.redd.it/iDdntscPf-nfWKqzHRGFmhVxZm4hZgaKe5oyFws-yzA.png?auto=webp&s=38648ef0dc2c3fce76d5e1d8639234d8da0152b2'
      )
    }

    return channel.send(e)
  }
}
