const Command = require('../../core/Command')

module.exports = class ModMail extends Command {
  constructor(client) {
    super(client, {
      name: 'modmail',
      category: 'General',
      description: 'Send a message to the mods',
      usage: ['mm <message>'],
      aliases: ['mm'],
      guildOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { warningMessage, embed } = Utils
    const { author, guild } = msg

    // * ------------------ Config --------------------

    const { prefix, modMailChannel } = db.server

    // * ------------------ Check Config --------------------

    const serverModMailChannel = guild.channels.get(modMailChannel)

    // * ------------------ Logic --------------------

    if (!modMailChannel) {
      return warningMessage(
        msg,
        `It appears that you don't have an Mod Mail channel set.
        \`${prefix}server set modMailChannel <channelID>\` to set one`
      )
    }

    msg.delete()
    const m = await msg.reply('Message sent to the mods')
    m.delete(5000)

    return serverModMailChannel.send(
      embed('yellow', 'check.png')
        .setTitle(`Mod Mail`)
        .setDescription(`${args.join(' ')}`)
        .setFooter(`From ${author.tag}`, author.avatarURL)
    )
  }
}
