/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import Canvas from 'canvas'
import { Attachment, GuildMember, TextChannel } from 'discord.js'
import path from 'path'

import { serverConfig } from '../core/database/database'

export const guildMemberAdd = async (member: GuildMember) => {
  const db = await serverConfig(member.guild.id)
  const { welcomeChannel, prefix } = JSON.parse(db.get('config') as string)

  const channel = member.guild.channels.get(welcomeChannel) as TextChannel

  /////////////////////////////////////////////////////////////////////
  if (!channel) return

  Canvas.registerFont(path.join(__dirname, '..', 'core', 'images', 'GENUINE.ttf'), {
    family: 'GENUINE'
  })

  const canvas = Canvas.createCanvas(800, 400)

  const ctx = canvas.getContext('2d')

  const background = await Canvas.loadImage(`${__dirname}/../core/images/welcome.png`)
  ctx.drawImage(background, 0, 0, canvas.width + 2, canvas.height + 2)

  ctx.strokeStyle = 'black'
  ctx.strokeRect(0, 0, canvas.width, canvas.height)

  // Greetings
  ctx.font = '50px GENUINE'
  ctx.fillStyle = '#dfdfdf'
  ctx.fillText(`WELCOME:`, 20, 380)

  // Username
  ctx.font = '50px GENUINE'
  ctx.fillStyle = '#a2ba00'
  const textLength = member.user.username.length
  ctx.fillText(member.user.username.toUpperCase(), 280 - textLength, 380)

  // Rules
  ctx.font = '30px GENUINE'
  ctx.fillStyle = '#dfdfdf'
  ctx.fillText(`View our rules with [ ${prefix}rules ]`, 20, 280)

  // Roles
  ctx.font = '30px GENUINE'
  ctx.fillStyle = '#dfdfdf'
  ctx.fillText(`View our roles with [ ${prefix}roles ]`, 20, 310)

  // Pick up the pen
  ctx.beginPath()
  // Start the arc to form a circle
  ctx.arc(120, 120, 100, 0, Math.PI * 2)
  // Put the pen down
  ctx.closePath()
  // Clip off the region you drew on
  ctx.clip()

  // Avatar
  const avatar = await Canvas.loadImage(member.user.displayAvatarURL)
  ctx.drawImage(avatar, 20, 20, 200, 200)

  const attachment = new Attachment(canvas.toBuffer(), 'welcome-image.png')

  channel.send(`Welcome home, ${member}!`, attachment)
}
