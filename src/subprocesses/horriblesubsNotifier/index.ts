/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { MessageEmbed, TextChannel, WebhookClient } from 'discord.js'
import Watcher from 'feed-watcher'
import fs from 'fs'
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'

export default class HorriblesubsNotifier extends Subprocess {
  feed: string
  notifyChannelID: string
  animeToWatchFor: string[]

  constructor() {
    super({
      name: 'horriblesubsNotifier',
      description: 'Will DM your user when your selected anime are released on HorribleSubs.info',
      disabled: false
    })

    this.feed = 'https://horriblesubs.info/rss.php?res=1080'
    this.notifyChannelID = '687579377466474517'
    this.animeToWatchFor = [
      'Isekai Quartet',
      'Plunderer',
      'black clover',
      'boku no hero',
      'Nekopara',
      'Phantasy Star Online'
    ]
  }

  public async run(client: BotClient) {
    const channel = (await client.channels.fetch(this.notifyChannelID)) as TextChannel

    const watcher = new Watcher(this.feed, 10)

    watcher.on('new entries', async (entries: RootObject[]) => {
      for (const entry of entries) {
        for (const anime of this.animeToWatchFor) {
          const reg = new RegExp(anime.toLowerCase(), 'gmi')

          if (entry.title.toLowerCase().match(reg)) {
            await channel.send(
              new MessageEmbed().setTitle(
                `[ ${entry.title} ] was just released on HorribleSubs! [Here's](${entry.link}) your magnet link to go download it!`
              )
            )
          } else {
            await channel.send(
              new MessageEmbed().setTitle(
                `[ ${entry.title} ] was just released on HorribleSubs! [Here's](${entry.link}) your magnet link to go download it!`
              )
            )
          }
        }
      }
    })

    // Start watching the feed.

    watcher.start()
  }
}

interface RootObject {
  title: string
  description?: any
  summary?: any
  date: string
  pubdate: string
  pubDate: string
  link: string
  guid: string
  author?: any
  comments?: any
  origlink?: any
  image: Image
  source: Image
  categories: any[]
  enclosures: any[]
  'rss:@': Image
  'rss:title': Rsstitle
  'rss:link': Rsstitle
  'rss:guid': Rssguid
  'rss:pubdate': Rsstitle
  meta: Meta
}

interface Meta {
  '#ns': N[]
  '@': N[]
  '#xml': Image
  '#type': string
  '#version': string
  title: string
  description: string
  date?: any
  pubdate?: any
  pubDate?: any
  link: string
  xmlurl?: any
  xmlUrl?: any
  author?: any
  language?: any
  favicon?: any
  copyright?: any
  generator?: any
  cloud: Image
  image: Image
  categories: any[]
  'rss:@': Image
  'rss:title': Rsstitle
  'rss:description': Rsstitle
  'rss:link': Rsstitle
}

interface N {
  'xmlns:atom': string
}

interface Rssguid {
  '@': _
  '#': string
}

interface _ {
  ispermalink: string
}

interface Rsstitle {
  '@': Image
  '#': string
}

interface Image {}
