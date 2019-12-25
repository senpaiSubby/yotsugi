/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'

export default class Clear extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'clear',
      category: 'Admin',
      description: 'Removes messages',
      usage: [`clear <0-100>`, 'clear <@user> <0-100>'],
      aliases: ['rm'],
      guildOnly: true,
      args: true,
      permsNeeded: ['MANAGE_MESSAGES']
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

    await msg.delete()

    const { warningMessage } = client.Utils
    const { channel } = msg
    const user = msg.mentions.users.first()

    // * ------------------ Logic --------------------

    if (channel.type === 'dm') return
    const amount = user ? args[1] : args[0]

    if (user && isNaN(args[1])) return warningMessage(msg, 'The amount parameter isn`t a number!')

    if (!user && isNaN(args[0])) return warningMessage(msg, 'The amount parameter isn`t a number!')

    if (amount > 100) return warningMessage(msg, 'You can`t delete more than 100 messages at once!')

    if (amount < 1) return warningMessage(msg, 'You have to delete at least 1 msg!')

    let messages = (await channel.fetchMessages({ limit: user ? 100 : amount })) as any

    if (user) {
      const filterBy = user ? user.id : client.user.id
      messages = messages
        .filter((m: NezukoMessage) => m.author.id === filterBy)
        .array()
        .slice(0, amount)
    }
    return channel.bulkDelete(messages)
  }
}
