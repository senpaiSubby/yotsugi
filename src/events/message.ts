/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage } from 'typings'
import { BotClient } from '../core/BotClient'
import { MessageManager } from '../core/managers/MessageManager'

export const onMessage = async (msg: NezukoMessage, client: BotClient) => {
  if (msg.author.bot) return

  // Log and parse all messages in DM's and guilds
  await new MessageManager(client, msg).log()

  await client.commandManager.handleMessage(msg, client)
}
