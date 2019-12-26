const Command = require('../../core/Command')

module.exports = class Announce extends Command {
  constructor(client) {
    super(client, {
      name: 'announce',
      category: 'Admin',
      description: 'Send a message to your announcement channel',
      usage: ['announce <hey guys GIVEAWAY!>'],
      guildOnly: true,
      args: true,
      permsNeeded: ['MANAGE_GUILD']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { warningMessage, embed } = Utils
    const { author, guild } = msg

    // * ------------------ Config --------------------

    const { prefix, announcementChannel } = db.server

    // * ------------------ Check Config --------------------

    const serverAnnouncementChannel = guild.channels.get(announcementChannel)

    // * ------------------ Logic --------------------

    if (!announcementChannel) {
      return warningMessage(
        msg,
        `It appears that you don't have an announcement channel set.
        \`${prefix}server set announcementChannel <channelID>\` to set one`
      )
    }

    const everyone = msg.guild.defaultRole
    await serverAnnouncementChannel.send(everyone.toString())
    return serverAnnouncementChannel.send(
      embed('blue', 'news.png')
        .setTitle('ANNOUNCEMENT!')
        .setDescription(`**${args.join(' ')}**`)
        .setTimestamp(new Date())
        .setFooter(`From ${author.tag}`, author.avatarURL)
    )
  }
}
