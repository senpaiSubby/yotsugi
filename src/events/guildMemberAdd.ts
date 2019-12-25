/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { GuildMember, TextChannel } from 'discord.js'

import { client } from '../index'

client.on('guildMemberAdd', async (member: GuildMember) => {
  const { serverConfig, Utils } = client
  const { embed } = Utils

  const db = await serverConfig.findOne({ where: { id: member.guild.id } })
  const config = JSON.parse(db.dataValues.config)

  const welcomeChannel = config.welcomeChannel
  const prefix: string = config.prefix

  const e = embed()
    .setColor('RANDOM')
    .setThumbnail(member.guild.iconURL)
    .setAuthor(member.user.username, member.user.avatarURL)
    .setTitle(`Welcome To ${member.guild.name}!`)
    .setDescription(
      `Please take a look at our rules by typing **${prefix}rules**!\nView our commands with **${prefix}help**\nEnjoy your stay!`
    )
  const channel = member.guild.channels.get(welcomeChannel) as TextChannel
  return channel!.send(e)
})
