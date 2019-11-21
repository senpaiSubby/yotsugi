const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class BanUser extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      category: 'Admin',
      description: 'Ban a user',
      usage: 'ban @user <reason for ban>',
      guildOnly: true,
      args: true,
      permsNeeded: ['BAN_MEMBERS']
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

    const target = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]))
    const reason = args.slice(1).join(' ')

    if (!target) return msg.reply('please specify a member to ban!')
    if (!reason) return msg.reply('please specify a reason for this ban!')

    const embed = Utils.embed(msg, 'red')
      .setThumbnail(target.user.avatarURL)
      .addField('Banned Member', `**${target.user.username}** with an ID: ${target.user.id}`)
      .addField('Banned By', `**${author.username}** with an ID: ${author.id}`)
      .addField('Banned Time', msg.createdAt)
      .addField('Banned At', channel)
      .addField('Banned Reason', reason)
      .setFooter('Banned user information', target.user.displayAvatarURL)

    await target.ban(reason)
    await channel.send(`${target.user.username} was banned by ${author} for ${reason}`)
    return serverLogsChannel.send(embed)
  }
}
module.exports = BanUser
