const Command = require('../../core/Command')

module.exports = class Invite extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      category: 'Information',
      description: 'Invite Subby to your own server'
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { embed } = client.Utils
    const { channel } = msg

    // * ------------------ Logic --------------------

    const invite = await client.generateInvite([
      'MANAGE_MESSAGES',
      'CREATE_INSTANT_INVITE',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'MANAGE_CHANNELS',
      'MANAGE_GUILD',
      'MANAGE_MESSAGES',
      'MANAGE_ROLES'
    ])

    return channel.send(
      embed(msg)
        .setTitle('SubbyBot')
        .setDescription(
          'Thanks for showing interest in SubbyBot! Click the link below to invite her to your server.'
        )
        .setThumbnail(client.user.avatarURL)
        .addField('\u200b', `[Click Here](${invite})`)
    )
  }
}
