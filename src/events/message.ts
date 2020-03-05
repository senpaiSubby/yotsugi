/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage, ServerDBConfig } from 'typings'
import { database } from '../core/database/database'
import { ActivityLogger } from '../core/managers/ActivityLogger'
import { LevelManager } from '../core/managers/LevelManager'
import { MessageManager } from '../core/managers/MessageManager'
import { NezukoClient } from '../core/NezukoClient'
import { Verify } from '../core/Verify'

export const onMessage = async (msg: NezukoMessage, client: NezukoClient) => {
  if (msg.author.bot) return

  const SDB = await database.models.Servers.findOne({
    where: { id: msg.guild.id }
  })

  const { leveling, prefix } = JSON.parse(
    SDB.get('config') as string
  ) as ServerDBConfig

  if (
    (msg.channel.type !== 'dm' && !msg.content.startsWith(prefix)) ||
    msg.content.length < prefix.length
  ) {
    // Give user exp
    if (leveling) await new LevelManager(client, msg).manage()

    const activityLogger = new ActivityLogger()
    await activityLogger.log(msg)

    await Verify.member(msg)
  }

  // Log and parse all messages in DM's and guilds
  await new MessageManager(client, msg).log()

  await client.commandManager.handleMessage(msg, client, true)
}
