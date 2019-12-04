const Command = require('../../core/Command')

module.exports = class KickUsers extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      category: 'Admin',
      description: 'Kick em out',
      usage: [`kick <@username>`],
      guildOnly: true,
      args: true,
      permsNeeded: ['KICK_MEMBERS']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { warningMessage, embed } = Utils
    const { author, channel, guild, mentions, createdAt } = msg

    // * ------------------ Config --------------------

    const { prefix, LoggersChannel } = db.server

    const serverLoggersChannel = guild.channels.get(LoggersChannel)

    // * ------------------ Check Config --------------------

    if (!serverLoggersChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a Loggers channel.
        Please set one with \`${prefix}server set LoggersChannel <channelID>\``
      )
    }

    // * ------------------ Logic --------------------

    if (msg.mentions.members.size === 0) {
      return warningMessage(msg, `Please mention a user to kick`)
    }

    const kickMember = mentions.members.first()

    if (!args[1]) return warningMessage(msg, `Please put a reason for the kick`)

    const target = await kickMember.kick(args.join(' '))

    const reason = args.slice(1).join(' ')
    return serverLoggersChannel.send(
      embed('yellow')
        .setThumbnail(target.user.avatarURL)
        .addField('Kicked Member', `**${target.user.username}** with an ID: ${target.user.id}`)
        .addField('Kicked By', `**${author.username}** with an ID: ${author.id}`)
        .addField('Kicked Time', createdAt)
        .addField('Kicked At', channel)
        .addField('Kicked Reason', reason)
        .setFooter('Kicked user information', target.user.displayAvatarURL)
    )
  }
}
