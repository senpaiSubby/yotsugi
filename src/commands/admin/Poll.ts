/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Poll your users
 */
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

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    // Delete original message
    await msg.delete()

    const { embed } = client.Utils

    // * ------------------ Logic --------------------

    // Create embed for poll
    const pollembed = embed('green')
      .setFooter('React to vote')
      .setDescription(args.join(' '))
      .setTitle(`Poll created by ${msg.author.username}`)
      .setTimestamp(msg.createdAt)

    // Await the message
    const m = (await msg.channel.send(pollembed)) as Message

    // Wait for reactions
    await m.react('✅')
    await m.react('❌')
  }
}
