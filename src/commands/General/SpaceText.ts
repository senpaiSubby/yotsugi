/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoClient } from 'core/NezukoClient'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'

export default class SpaceText extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'space',
      category: 'General',
      description: 'Spaces text out for dramatic effect',
      usage: ['space <text>'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api: boolean) {
    // * ------------------ Setup --------------------
    const { channel } = msg

    // * ------------------ Usage Logic --------------------

    const amount = 2

    return channel.send(
      `**${args
        .join(' '.repeat(amount / 2))
        .split('')
        .join(' '.repeat(amount))}
    **`
    )
  }
}
