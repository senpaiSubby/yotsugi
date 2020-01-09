/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Message, MessageReaction, TextChannel, User } from 'discord.js'
import { ServerDBConfig } from 'typings'
import { database } from '../core/database/database'
import { Utils } from '../core/utils/Utils'

export const messageReactionAdd = async (reaction: MessageReaction, user: User) => {
  if (reaction.emoji.name !== '⭐') return

  const { message: msg } = reaction
  const { channel } = msg
  const { embed } = Utils

  const db = await database.models.ServerConfig.findOne({ where: { id: msg.guild.id } })
  const { starboardChannel, prefix } = JSON.parse(db.get('config') as string) as ServerDBConfig

  const extension = async (attachment) => {
    const imageLink = attachment.split('.')
    const typeOfImage = imageLink[imageLink.length - 1]
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage)
    if (!image) return ''
    return attachment
  }

  if (msg.author.id === user.id) {
    if (channel.id === starboardChannel) return
    const m = (await msg.reply(
      embed().setDescription(`**You cannot star your own messages**`)
    )) as Message
    return m.delete(10000)
  }

  if (msg.author.bot) {
    if (channel.id === starboardChannel) return
    const m = (await msg.reply(
      embed().setDescription(`**You cannot star bot messages**`)
    )) as Message
    return m.delete(10000)
  }
  const starChannel = msg.guild.channels.get(starboardChannel) as TextChannel

  if (!starChannel) {
    return this.Utils.warningMessage(
      msg,
      `It appears that you do not have a StarBoard channel. Please set one with \`${prefix}server set starboardChannel <channelID>\``
    )
  }

  const fetchedMessages = await starChannel.fetchMessages({ limit: 100 })

  const stars = fetchedMessages.find(
    (m) => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(msg.id)
  )

  if (stars) {
    const star = /^⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text)
    const foundStar = stars.embeds[0]
    const image = msg.attachments.size > 0 ? await extension(msg.attachments.array()[0].url) : ''
    const e = embed()
      .setColor('RANDOM')
      .setColor(foundStar.color)
      .setDescription(foundStar.description)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
      .setTimestamp()
      .setFooter(`⭐ ${parseInt(star[1], 10) + 1} | ${msg.id}`)
      .setImage(image)
    const starMsg = await starChannel.fetchMessage(stars.id)
    return starMsg.edit(e)
  }

  if (!stars) {
    const image = msg.attachments.size > 0 ? await extension(msg.attachments.array()[0].url) : ''
    if (image === '' && msg.cleanContent.length < 1) {
      const m = (await channel.send(
        embed().setDescription(`**You cannot star an empty message**`)
      )) as Message

      return m.delete(10000)
    }

    const e = embed()
      .setColor('RANDOM')
      .setColor(15844367)
      .setDescription(msg.cleanContent)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
      .setTimestamp(new Date())
      .setFooter(`⭐ 1 | ${msg.id}`)
      .setImage(image)
    return starChannel.send(e)
  }
}
