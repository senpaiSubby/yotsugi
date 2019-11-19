const { RichEmbed } = require('discord.js')
const { client } = require('../index')

client.on('guildMemberAdd', (member) => {
  const { prefix } = client.config.general
  const embed = new RichEmbed().setColor('RANDOM')
  embed.setColor(3447003)
  embed.setThumbnail(member.guild.iconURL)
  embed.setAuthor(member.user.username, member.user.avatarURL)
  embed.setTitle(`Welcome To ${member.guild.name}!`)
  embed.setDescription(
    `Please take a look at our rules by typing **${prefix}rules**!\nView our commands with **${prefix}help**\nEnjoy your stay!`
  )
  const channel = member.guild.channels.get(client.config.general.welcomeChannel)
  return channel.send({ embed })
})
