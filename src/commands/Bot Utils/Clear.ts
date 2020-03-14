/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'

/**
 * Clear messages from channels
 */
export default class Clear extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['rm'],
      args: true,
      category: 'Bot Utils',
      description: 'Remove messages from channels',
      guildOnly: true,
      name: 'clear',
      permsNeeded: ['MANAGE_MESSAGES'],
      usage: [`clear [0-100]`, 'clear [@user] [0-100]']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    await msg.delete()

    const { warningMessage, asyncForEach } = Utils
    const { channel } = msg

    // * ------------------ Logic --------------------

    // If user is mentioned then assign them for the deletion
    const user = msg.mentions.users.first()

    // Get the amount of messages to delete
    const amount = user ? args[1] : args[0]

    // Check if the number of messages specified is a number
    if ((user && isNaN(args[1])) || (!user && isNaN(args[0]))) {
      return warningMessage(msg, 'The amount parameter isn`t a number!')
    }

    // We cant delete more than 100 messages at once so notify user
    if (amount > 100) {
      return warningMessage(msg, 'You can`t delete more than 100 messages at once!')
    }

    // Check if the user specified at least 1 message to be deleted
    if (amount < 1) {
      return warningMessage(msg, 'You have to delete at least 1 msg!')
    }

    // Search channel for messages from user if specified or target number of messages
    const foundMessages = await channel.fetchMessages({
      limit: user ? 100 : amount
    })

    // If a user was specified filter messages by their user
    if (user) {
      const filterBy = user ? user.id : client.user.id
      const messagesToDelete = foundMessages
        .filter((m: Message) => m.author.id === filterBy)
        .array()
        .slice(0, amount)
      return asyncForEach(messagesToDelete, async (message: Message) => await message.delete())
    }

    // Delete messages
    try {
      // Try to delete messages if they are under 2 weeks old
      await channel.bulkDelete(foundMessages)
    } catch {
      // If older then delete one by one
      await asyncForEach(foundMessages.array(), async (message: Message) => await message.delete())
    }
  }
}
