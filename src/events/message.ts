/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { CommandManager } from '../core/CommandManager'
import { Message } from 'discord.js'
import { client } from '../index'

// Load commands
const manager = new CommandManager(client)
manager.loadCommands(`${__dirname}/../commands`)

// Handle messages
client.on('message', (message: Message) => manager.handleMessage(message, client))
client.on('messageUpdate', (old: Message, _new: Message) => {
  if (old.content !== _new.content) manager.handleMessage(_new, client)
})

export { manager }
