/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { BotClient } from 'core/BotClient'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { Utils } from '../../core/Utils'

export default class Jumbo extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Fun',
      description: 'Enlarge emojies',
      name: 'jumbo',
      usage: ['jumbo :emoji:']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { channel } = msg
    const { warningMessage } = Utils

    if (args[0].charCodeAt(0) >= 55296) {
      return warningMessage(msg, 'Cannot enlarge built-in discord emoji.')
    }

    const match = args[0].match(/<:[a-zA-Z0-9_-]+:(\d{18})>/)

    if (!match || !match[1]) {
      return warningMessage(msg, 'Please provide a valid emoji.')
    }

    const emoji = client.emojis.get(match[1])

    if (!emoji) {
      return warningMessage(msg, 'That emoji could not be identified!')
    }

    return channel.send({
      files: [emoji.url]
    })
  }
}
