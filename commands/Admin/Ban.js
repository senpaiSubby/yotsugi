/* eslint-disable class-methods-use-this */
const { RichEmbed } = require('discord.js')
const Command = require('../../core/Command')

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
    const target = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]))
    const reason = args.slice(1).join(' ')
    const logs = msg.guild.channels.find('name', client.config.general.logsChannel)

    if (!target) return msg.reply('please specify a member to ban!')
    if (!reason) return msg.reply('please specify a reason for this ban!')
    if (!logs)
      return msg.reply(
        `please create a channel called ${client.config.general.logsChannel} to log the bans!`
      )

    const embed = new RichEmbed()
      .setColor('RANDOM')
      .setThumbnail(target.user.avatarURL)
      .addField('Banned Member', `${target.user.username} with an ID: ${target.user.id}`)
      .addField('Banned By', `${msg.author.username} with an ID: ${msg.author.id}`)
      .addField('Banned Time', msg.createdAt)
      .addField('Banned At', msg.channel)
      .addField('Banned Reason', reason)
      .setFooter('Banned user information', target.user.displayAvatarURL)

    msg.channel.send(`${target.user.username} was banned by ${msg.author} for ${reason}`)
    target.ban(reason)
    return logs.send(embed)
  }
}
module.exports = BanUser
