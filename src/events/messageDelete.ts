/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message, TextChannel } from 'discord.js'

import { serverConfig } from '../core/database/database'
import { NezukoClient } from '../core/NezukoClient'
import { Utils } from '../core/utils/Utils'

export const messageDelete = async (message: Message, client: NezukoClient) => {
  const { content, channel, member } = message
  const { user } = member
  const { config } = client
  const { embed } = Utils

  if (member.id !== config.ownerID && member.id !== client.user.id && !config.exemptUsers.includes(member.id)) {
    const db = await serverConfig(member.guild.id)
    const { logChannel } = JSON.parse(db.get('config') as string)

    const foundChannel = member.guild.channels.get(logChannel) as TextChannel

    if (foundChannel && message.content) {
      const e = embed(message)
        .setTitle('Message Deleted')
        .setDescription(`Message sent by [ <@${member.id}> ] was deleted in [ <#${channel.id}> ]`)
        .addField('Message Content', content)
        .setAuthor(user.tag, user.avatarURL)
        .setFooter(`User ID [ ${user.id} ]`)
      return foundChannel.send(e)
    }
  }
}
