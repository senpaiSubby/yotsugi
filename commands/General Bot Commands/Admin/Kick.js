const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class KickUsers extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      category: 'Admin',
      description: 'Kick em out',
      usage: `kick <@username>`,
      guildOnly: true,
      args: true,
      permsNeeded: ['KICK_MEMBERS']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { author, channel } = msg

    const serverConfig = await Database.Models.serverConfig.findOne({
      where: { id: msg.guild.id }
    })
    const { prefix, logsChannel } = serverConfig.dataValues

    const serverLogsChannel = msg.guild.channels.get(logsChannel)

    if (!serverLogsChannel)
      return msg.channel.send(
        Utils.embed(msg, 'yellow').setDescription(
          `It appears that you do not have a logs channel.\nPlease set one with \`${prefix}server set logsChannel <channelID>\``
        )
      )

    if (msg.mentions.members.size === 0) {
      const m = await msg.reply(
        Utils.embed(msg, 'yellow').setDescription('Please mention a user to kick')
      )
      return m.delete(10000)
    }

    const kickMember = msg.mentions.members.first()

    if (!args[1]) {
      const m = await msg.reply(
        Utils.embed(msg, 'yellow').setDescription("Please put a reason for the kick'")
      )
      return m.delete(10000)
    }
    const target = await kickMember.kick(args.join(' '))

    const reason = args.slice(1).join(' ')
    return serverLogsChannel.send(
      Utils.embed(msg, 'yellow')
        .setThumbnail(target.user.avatarURL)
        .addField('Kicked Member', `**${target.user.username}** with an ID: ${target.user.id}`)
        .addField('Kicked By', `**${author.username}** with an ID: ${author.id}`)
        .addField('Kicked Time', msg.createdAt)
        .addField('Kicked At', channel)
        .addField('Kicked Reason', reason)
        .setFooter('Kicked user information', target.user.displayAvatarURL)
    )
  }
}
module.exports = KickUsers
