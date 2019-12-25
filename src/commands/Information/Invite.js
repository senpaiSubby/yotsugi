import { Command } from '../../core/Command'

export default  class Invite extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      category: 'Information',
      description: 'Invite Nezuko to your own server'
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
      embed('green')
        .setTitle('Nezuko')
        .setDescription(
          'Thanks for showing interest in Nezuko! Click the link below to invite her to your server.'
        )
        .setThumbnail(client.user.avatarURL)
        .addField('\u200b', `[Click Here](${invite})`)
    )
  }
}
