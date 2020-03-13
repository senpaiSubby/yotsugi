/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class Ping extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'ping',
      category: 'Bot Utils',
      description: 'Check discord latency',
      ownerOnly: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage) {
    // * ------------------ Setup --------------------

    const { standardMessage } = client.Utils
    const { createdTimestamp } = msg

    // * ------------------ Logic --------------------

    return standardMessage(msg, 'green', `Pong! My ping is [ ${Date.now() - createdTimestamp} ] ms`)
  }
}
