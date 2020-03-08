/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage, ServerDBConfig } from 'typings'
import { BotClient } from '../core/BotClient'
import { database } from '../core/database/database'
import { MessageManager } from '../core/managers/MessageManager'

export const onMessage = async (msg: NezukoMessage, client: BotClient) => {
  if (msg.author.bot) return

  const SDB = await database.models.Servers.findOne({
    where: { id: msg.guild.id }
  })

  const { prefix } = JSON.parse(SDB.get('config') as string) as ServerDBConfig

  // Log and parse all messages in DM's and guilds
  await new MessageManager(client, msg).log()

  await client.commandManager.handleMessage(msg, client, true)
}
