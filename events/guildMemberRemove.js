const { RichEmbed } = require('discord.js')
const { client } = require('../index')
const Database = require('../core/Database')

client.on('guildMemberRemove', async (member) => {
  const { colors } = client

  const serverConfig = await Database.Models.serverConfig.findOne({
    where: { id: member.guild.id }
  })
  const { welcomeChannel } = serverConfig.dataValues

  const embed = new RichEmbed().setColor(colors.yellow)
  embed.setThumbnail(member.guild.iconURL)
  embed.setAuthor(member.user.username, member.user.avatarURL)
  embed.setTitle(`Left the server!`)
  embed.setDescription(`Sorry to see you go!`)
  const channel = member.guild.channels.get(welcomeChannel)
  return channel.send({ embed })
})
