/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Ping extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'ping',
      category: 'Networking',
      description: 'Check discord latency',
      ownerOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage) {
    // * ------------------ Setup --------------------

    const { standardMessage } = client.Utils
    const { createdTimestamp } = msg

    // * ------------------ Logic --------------------

    return standardMessage(msg, `Pong! Your ping is [ ${Date.now() - createdTimestamp} ] ms`)
  }
}
