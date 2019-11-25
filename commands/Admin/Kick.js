const Command = require('../../../noelleBot/core/Command')
const Database = require('../../../noelleBot/core/Database')

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
    const { warningMessage } = Utils
    const { author, channel } = msg

    const serverConfig = await Database.Models.serverConfig.findOne({
      where: { id: msg.guild.id }
    })
    const { prefix, logsChannel } = serverConfig.dataValues

    const serverLogsChannel = msg.guild.channels.get(logsChannel)

    if (!serverLogsChannel)
      return warningMessage(
        msg,
        `It appears that you do not have a logs channel.\nPlease set one with \`${prefix}server set logsChannel <channelID>\``
      )

    if (msg.mentions.members.size === 0) {
      return warningMessage(msg, `Please mention a user to kick`)
    }

    const kickMember = msg.mentions.members.first()

    if (!args[1]) {
      return warningMessage(msg, `Please put a reason for the kick`)
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
