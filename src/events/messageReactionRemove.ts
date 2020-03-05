/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { MessageReaction, TextChannel } from 'discord.js'
import { ServerDBConfig } from 'typings'

import { serverConfig } from '../core/database/database'
import { Utils } from '../core/Utils'

export const messageReactionRemove = async (reaction: MessageReaction) => {
  if (reaction.emoji.name !== '⭐') return

  const { message: msg } = reaction
  const { embed, warningMessage } = Utils

  const db = await serverConfig(msg.guild.id)
  const { starboardChannel, prefix } = JSON.parse(
    db.get('config') as string
  ) as ServerDBConfig

  const extension = async (attachment) => {
    const imageLink = attachment.split('.')
    const typeOfImage = imageLink[imageLink.length - 1]
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage)
    if (!image) return ''
    return attachment
  }

  const starChannel = msg.guild.channels.get(starboardChannel) as TextChannel

  if (!starChannel) {
    return warningMessage(
      msg,
      `It appears that you do not have a StarBoard channel.
      Please set one with \`${prefix}server set starBoard <channelID>\``
    )
  }

  const fetchedMessages = await starChannel.fetchMessages({ limit: 100 })
  const stars = fetchedMessages.find(
    (m) =>
      m.embeds[0].footer.text.startsWith('⭐') &&
      m.embeds[0].footer.text.endsWith(reaction.message.id)
  )
  if (stars) {
    const star = /^⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(
      stars.embeds[0].footer.text
    )
    const foundStar = stars.embeds[0]
    const image =
      msg.attachments.size > 0
        ? await extension(msg.attachments.array()[0].url)
        : ''
    const e = embed(msg)
      .setColor('RANDOM')
      .setColor(foundStar.color)
      .setDescription(foundStar.description)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
      .setTimestamp()
      .setFooter(`⭐ ${parseInt(star[1], 10) - 1} | ${msg.id}`)
      .setImage(image)
    const starMsg = await starChannel.fetchMessage(stars.id)
    await starMsg.edit(e)
    if (parseInt(star[1], 10) - 1 === 0) return starMsg.delete(1000)
  }
}
