const { RichEmbed } = require('discord.js')
const { client } = require('../index')

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.emoji.name !== '⭐') return

  const { message } = reaction
  const { serverConfig } = client

  const db = await serverConfig.findOne({ where: { id: guild.id } })
  const { starboardChannel, prefix } = JSON.parse(db.dataValues.config)

  const extension = async (attachment) => {
    const imageLink = attachment.split('.')
    const typeOfImage = imageLink[imageLink.length - 1]
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage)
    if (!image) return ''
    return attachment
  }

  if (message.author.id === user.id) {
    const m = await message.channel.send(`${user}, you cannot star your own messages.`)
    return m.delete(10000)
  }

  if (message.author.bot) {
    const m = await message.channel.send(`${user}, you cannot star bot messages.`)
    return m.delete(10000)
  }
  const starChannel = message.guild.channels.get(starboardChannel)

  if (!starChannel) {
    return message.channel.send(
      `It appears that you do not have a StarBoard channel. Please set one with **${prefix}server set starBoard <channelID>**`
    )
  }

  const fetchedMessages = await starChannel.fetchMessages({ limit: 100 })
  const stars = fetchedMessages.find(
    (m) => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id)
  )

  if (stars) {
    const star = /^⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text)
    const foundStar = stars.embeds[0]
    const image =
      message.attachments.size > 0 ? await extension(message.attachments.array()[0].url) : ''
    const embed = new RichEmbed()
      .setColor('RANDOM')
      .setColor(foundStar.color)
      .setDescription(foundStar.description)
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setTimestamp()
      .setFooter(`⭐ ${parseInt(star[1], 10) + 1} | ${message.id}`)
      .setImage(image)
    const starMsg = await starChannel.fetchMessage(stars.id)
    return starMsg.edit({ embed })
  }

  if (!stars) {
    const image =
      message.attachments.size > 0
        ? await extension(reaction, message.attachments.array()[0].url)
        : ''
    if (image === '' && message.cleanContent.length < 1) {
      const m = await message.channel.send(`${user}, you cannot star an empty message.`)
      return m.delete(10000)
    }

    const embed = new RichEmbed()
      .setColor('RANDOM')
      .setColor(15844367)
      .setDescription(message.cleanContent)
      .setAuthor(message.author.tag, message.author.displayAvatarURL)
      .setTimestamp(new Date())
      .setFooter(`⭐ 1 | ${message.id}`)
      .setImage(image)
    return starChannel.send({ embed })
  }
})
