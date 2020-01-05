/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { GuildMember, TextChannel } from 'discord.js'
import { database } from '../core/database/database'
import { Utils } from '../core/utils/Utils'

export const guildMemberRemove = async (member: GuildMember) => {
  const { embed } = Utils

  const db = await database.models.ServerConfig.findOne({ where: { id: member.guild.id } })
  const { welcomeChannel } = JSON.parse(db.get('config') as string)

  const e = embed()
    .setColor('RANDOM')
    .setThumbnail(member.guild.iconURL)
    .setAuthor(member.user.username, member.user.avatarURL)
    .setTitle(`Left the server!`)
    .setDescription(`Sorry to see you go!`)

  const channel = member.guild.channels.get(welcomeChannel) as TextChannel
  return channel.send(e)
}
