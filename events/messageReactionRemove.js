/* eslint-disable radix */
const { RichEmbed } = require('discord.js')
const Database = require('../core/Database')
const { client } = require('../index')

client.on('messageReactionRemove', async (reaction, user) => {
  const extension = async (attachment) => {
    const imageLink = attachment.split('.')
    const typeOfImage = imageLink[imageLink.length - 1]
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage)
    if (!image) return ''
    return attachment
  }

  const { msg } = reaction
  if (reaction.emoji.name !== '⭐') return

  const serverConfig = await Database.Models.serverConfig.findOne({
    where: { id: msg.guild.id }
  })
  const { prefix, starboardChannel } = serverConfig.dataValues

  if (reaction.emoji.name !== '⭐') return
  const starChannel = msg.guild.channels.get(starboardChannel)
  if (!starChannel)
    return msg.channel.send(
      `It appears that you do not have a StarBoard channel. Please set one with **${prefix}server set starBoard <channelID>**`
    )

  const fetchedMessages = await starChannel.fetchMessages({ limit: 100 })
  const stars = fetchedMessages.find(
    (m) =>
      m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(reaction.msg.id)
  )
  if (stars) {
    const star = /^⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text)
    const foundStar = stars.embeds[0]
    const image = msg.attachments.size > 0 ? await extension(msg.attachments.array()[0].url) : ''
    const embed = new RichEmbed()
      .setColor('RANDOM')
      .setColor(foundStar.color)
      .setDescription(foundStar.description)
      .setAuthor(msg.author.tag, msg.author.displayAvatarURL)
      .setTimestamp()
      .setFooter(`⭐ ${parseInt(star[1]) - 1} | ${msg.id}`)
      .setImage(image)
    const starMsg = await starChannel.fetchMessage(stars.id)
    await starMsg.edit({ embed })
    if (parseInt(star[1]) - 1 === 0) return starMsg.delete(1000)
  }
})
