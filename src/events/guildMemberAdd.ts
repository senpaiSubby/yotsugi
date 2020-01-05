/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { GuildMember, TextChannel } from 'discord.js'
import { database } from '../core/database/database'
import { Utils } from '../core/utils/Utils'

export const guildMemberAdd = async (member: GuildMember) => {
  const { embed } = Utils

  const db = await database.models.ServerConfig.findOne({ where: { id: member.guild.id } })
  const { welcomeChannel, prefix } = JSON.parse(db.get('config') as string)

  const e = embed()
    .setColor('RANDOM')
    .setThumbnail(member.guild.iconURL)
    .setAuthor(member.user.username, member.user.avatarURL)
    .setTitle(`Welcome To ${member.guild.name}!`)
    .setDescription(
      `Please take a look at our rules by typing **${prefix}rules**!\nView our commands with **${prefix}help**\nEnjoy your stay!`
    )

  const channel = member.guild.channels.get(welcomeChannel) as TextChannel
  return channel.send(e)
}
