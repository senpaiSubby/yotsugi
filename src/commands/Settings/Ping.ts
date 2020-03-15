/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'

/**
 * Command to check ping from bots server location to discord
 */
export default class Ping extends Command {
  constructor(client: BotClient) {
    super(client, {
      category: 'Settings',
      description: 'Check discord latency',
      name: 'ping',
      ownerOnly: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage) {
    // * ------------------ Setup --------------------

    const { standardMessage } = Utils
    const { createdTimestamp } = msg

    // * ------------------ Logic --------------------

    return standardMessage(msg, 'green', `Pong! My ping is [ ${Date.now() - createdTimestamp} ] ms`)
  }
}
