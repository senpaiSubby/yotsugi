const { client } = require('../index')

client.on('guildMemberAdd', async (member) => {
  const { serverConfig, Utils } = client
  const { embed } = Utils

  const db = await serverConfig.findOne({ where: { id: member.guild.id } })
  const { welcomeChannel, prefix } = JSON.parse(db.dataValues.config)

  const e = embed()
    .setColor('RANDOM')
    .setThumbnail(member.guild.iconURL)
    .setAuthor(member.user.username, member.user.avatarURL)
    .setTitle(`Welcome To ${member.guild.name}!`)
    .setDescription(
      `Please take a look at our rules by typing **${prefix}rules**!\nView our commands with **${prefix}help**\nEnjoy your stay!`
    )
  const channel = member.guild.channels.get(welcomeChannel)
  return channel.send(e)
})
