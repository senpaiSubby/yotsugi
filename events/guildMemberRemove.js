const { client } = require('../index')

client.on('guildMemberRemove', async (member) => {
  const { config, serverConfig, Utils } = client
  const { colors } = config
  const { embed } = Utils

  const db = await serverConfig.findOne({ where: { id: member.guild.id } })
  const { welcomeChannel } = JSON.parse(db.dataValues.config)

  const e = embed()
    .setColor(colors.yellow)
    .setThumbnail(member.guild.iconURL)
    .setAuthor(member.user.username, member.user.avatarURL)
    .setTitle(`Left the server!`)
    .setDescription(`Sorry to see you go!`)
  const channel = member.guild.channels.get(welcomeChannel)
  return channel.send(e)
})
