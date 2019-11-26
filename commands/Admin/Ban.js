const Command = require('../../core/Command')

class BanUser extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      category: 'Admin',
      description: 'Ban a user',
      usage: ['ban @user <reason for ban>'],
      guildOnly: true,
      args: true,
      permsNeeded: ['BAN_MEMBERS']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, serverConfig } = client
    const { warningMessage, standardMessage, embed } = Utils
    const { author, channel } = msg

    // * ------------------ Config --------------------

    const config = await serverConfig.findOne({
      where: { id: msg.guild.id }
    })
    const { prefix, logsChannel } = config.dataValues

    // * ------------------ Check Config --------------------

    const serverLogsChannel = msg.guild.channels.get(logsChannel)

    // * ------------------ Logic --------------------

    if (!serverLogsChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a logs channel.\nPlease set one with \`${prefix}server set logsChannel <channelID>\``
      )
    }
    const target = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]))
    const reason = args.slice(1).join(' ')

    if (!target) return warningMessage(msg, `Please specify a member to ban!`)
    if (!reason) return warningMessage(msg, `Please specify a reason for this ban!`)

    const e = embed(msg, 'red')
      .setThumbnail(target.user.avatarURL)
      .addField('Banned Member', `**${target.user.username}** with an ID: ${target.user.id}`)
      .addField('Banned By', `**${author.username}** with an ID: ${author.id}`)
      .addField('Banned Time', msg.createdAt)
      .addField('Banned At', channel)
      .addField('Banned Reason', reason)
      .setFooter('Banned user information', target.user.displayAvatarURL)

    await target.ban(reason)
    await standardMessage(msg, `${target.user.username} was banned by ${author} for ${reason}`)
    return serverLogsChannel.send(e)
  }
}
module.exports = BanUser
