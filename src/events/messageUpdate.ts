/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Message, TextChannel } from 'discord.js'
import { NezukoMessage } from 'typings'

import { serverConfig } from '../core/database/database'
import { NezukoClient } from '../core/NezukoClient'

export const messageUpdate = async (
  old: Message,
  _new: NezukoMessage,
  client: NezukoClient
) => {
  const { member, channel } = old
  const { Utils, config, commandManager } = client
  const { embed } = Utils

  if (old.content !== _new.content) {
    await commandManager.handleMessage(_new, client, false)

    if (
      old.member.id !== config.ownerID &&
      old.member.id !== client.user.id &&
      !config.exemptUsers.includes(member.id)
    ) {
      const db = await serverConfig(member.guild.id)
      const { logChannel } = JSON.parse(db.get('config') as string)

      const foundChannel = member.guild.channels.get(logChannel) as TextChannel

      if (foundChannel && _new.content) {
        const e = embed(old)
          .setTitle('Message Updated')
          .setDescription(
            `Message sent by [ <@${member.id}> ] was editited in [ <#${channel.id}> ]`
          )
          .addField('Old Message', old.content)
          .addField('New Content', _new.content)
          .setAuthor(member.user.tag, member.user.avatarURL)
          .setFooter(`User ID [ ${member.user.id} ]`)
        return foundChannel.send(e)
      }
    }
  }
}
