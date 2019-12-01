const Command = require('../../core/Command')

module.exports = class UnbanUser extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      category: 'Admin',
      description: 'Unbans a user',
      usage: ['unban <userID> <reason for unban>'],
      guildOnly: true,
      args: true,
      permsNeeded: ['BAN_MEMBERS']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { warningMessage, embed, db } = client.Utils
    const { author, channel, guild } = msg

    // * ------------------ Config --------------------

    const { prefix, logsChannel } = db.server

    const serverLogsChannel = msg.guild.channels.get(logsChannel)

    // * ------------------ Check Config --------------------

    if (!serverLogsChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a logs channel.
        Please set one with \`${prefix}server set logsChannel <channelID>\``
      )
    }

    // * ------------------ Logic --------------------

    let target
    const bans = await msg.guild.fetchBans()
    bans.forEach((user) => {
      if (user.id === args[0]) target = user
    })

    const reason = args.slice(1).join(' ')

    if (!target) return warningMessage(msg, `Please specify a member to unban!`)
    if (!reason) return warningMessage(msg, `Please specify a reason for this unban!`)
    await guild.unban(target, reason)

    return serverLogsChannel.send(
      embed('green')
        .addField('Unbanned Member', `**${target.username}** with an ID: ${target.id}`)
        .addField('Unbanned By', `**${author.username}** with an ID: ${author.id}`)
        .addField('Unbanned Time', msg.createdAt)
        .addField('Unbanned At', channel)
        .addField('Unbanned Reason', reason)
    )
  }
}
