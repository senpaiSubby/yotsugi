const { RichEmbed } = require('discord.js')
const { client } = require('../index')

client.on('guildMemberRemove', async (member) => {
  const { colors, db } = client

  const { welcomeChannel } = db.server

  const embed = new RichEmbed()
    .setColor(colors.yellow)
    .setThumbnail(member.guild.iconURL)
    .setAuthor(member.user.username, member.user.avatarURL)
    .setTitle(`Left the server!`)
    .setDescription(`Sorry to see you go!`)
  const channel = member.guild.channels.get(welcomeChannel)
  return channel.send(embed)
})
