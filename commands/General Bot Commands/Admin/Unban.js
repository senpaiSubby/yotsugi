const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class UnbanUser extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      category: 'Admin',
      description: 'Unbans a user',
      usage: 'unban <userID> <reason for unban>',
      guildOnly: true,
      args: true,
      permsNeeded: ['BAN_MEMBERS']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { author, channel, guild } = msg

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

    let target
    const bans = await msg.guild.fetchBans()
    bans.forEach((user) => {
      if (user.id === args[0]) target = user
    })

    const reason = args.slice(1).join(' ')

    if (!target) return msg.reply('please specify a member to unban!')
    if (!reason) return msg.reply('please specify a reason for this unban!')

    const embed = Utils.embed(msg, 'green')
      .addField('Unbanned Member', `**${target.username}** with an ID: ${target.id}`)
      .addField('Unbanned By', `**${author.username}** with an ID: ${author.id}`)
      .addField('Unbanned Time', msg.createdAt)
      .addField('Unbanned At', channel)
      .addField('Unbanned Reason', reason)

    await guild.unban(target, reason)

    return serverLogsChannel.send(embed)
  }
}
module.exports = UnbanUser
