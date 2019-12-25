/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'

export default class Poll extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'poll',
      category: 'Admin',
      description: 'Poll your members',
      usage: ['poll <whats the poll for?>'],
      permsNeeded: ['ADMINISTRATOR']
    })
  }

  /**
   * Run this command
   * @param client Nezuko client
   * @param msg Original message
   * @param args Optional arguments
   */
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { embed } = client.Utils

    // * ------------------ Logic --------------------

    const pollembed = embed('green')
      .setFooter('React to vote')
      .setDescription(args.join(' '))
      .setTitle(`Poll created by ${msg.author.username}`)
      .setTimestamp(msg.createdAt)
    const m = (await msg.channel.send(pollembed)) as NezukoMessage

    await m.react('✅')
    await m.react('❌')
    await msg.delete(1000)
  }
}
