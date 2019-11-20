const Command = require('../../../core/Command')

class BanUser extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      category: 'Admin',
      description: 'Ban a user',
      usage: 'ban @user',
      guildOnly: true,
      args: true,
      permsNeeded: ['BAN_MEMBERS']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { author, channel } = msg

    const target = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]))
    const reason = args.slice(1).join(' ')
    const logs = msg.guild.channels.find('name', client.config.logsChannel)

    if (!target) return msg.reply('please specify a member to ban!')
    if (!reason) return msg.reply('please specify a reason for this ban!')
    if (!logs)
      return msg.reply(
        `please create a channel called ${client.config.logsChannel} to log the bans!`
      )

    const embed = Utils.embed(msg)
      .setThumbnail(target.user.avatarURL)
      .addField('Banned Member', `${target.user.username} with an ID: ${target.user.id}`)
      .addField('Banned By', `${author.username} with an ID: ${author.id}`)
      .addField('Banned Time', msg.createdAt)
      .addField('Banned At', channel)
      .addField('Banned Reason', reason)
      .setFooter('Banned user information', target.user.displayAvatarURL)

    channel.send(`${target.user.username} was banned by ${author} for ${reason}`)
    target.ban(reason)
    return logs.send(embed)
  }
}
module.exports = BanUser
