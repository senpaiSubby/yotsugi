/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { RichEmbed, WebhookClient } from 'discord.js'
import Watcher from 'rss-watcher'
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'

export default class Template extends Subprocess {
  constructor() {
    super({
      name: 'HorribleSubsNotify',
      description: 'Will DM your user when your selected anime are released on HorribleSubs.info',
      disabled: false
    })
  }

  public async run(client: BotClient) {
    const webhook = new WebhookClient(
      '687579405291356196',
      'otXxnHQSz9Fbw0eiU7XwedvCuYBHvJ44NIhUEe7XoHtcQL8ASqS9vB2jbzAtlv0l1EyF'
    )

    const feed = 'https://horriblesubs.info/rss.php?res=1080'

    const animeToWatch = ['Isekai Quartet', 'Plunderer', 'black clover', 'boku no hero', 'Nekopara']

    const watcher = new Watcher(feed)

    watcher.on('new article', async (article) => {
      for (const anime of animeToWatch) {
        const reg = new RegExp(anime.toLowerCase(), 'gmi')
        if (article.title.toLowerCase().match(reg)) {
          const embed = new RichEmbed().setTitle(
            `[ ${article.title} ] was just released on HorribleSubs! [Here's](${article.link}) you magnet link to go download it!`
          )

          return webhook.send(`A new episode of [ ${anime.toUpperCase()} ] was just released!`, {
            username: 'Nezuko = Horrible Subs Watcher',
            embeds: [embed]
          })
        }
      }
    })
  }
}
