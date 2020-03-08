/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { MessageManager } from '../core/managers/MessageManager'

export const messageUpdate = async (old, _new, client) => {
  if (_new.author.bot) return

  // Log and parse all messages in DM's and guilds
  await new MessageManager(client, _new).log()

  await client.commandManager.handleMessage(_new, client)
}
