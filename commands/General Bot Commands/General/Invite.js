const Command = require('../../../core/Command')

class Invite extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      category: 'General',
      description: 'Invite Subby to your own server'
    })
  }

  async run(client, msg) {
    const { Utils } = client
    const { channel } = msg

    const invite = await client.generateInvite(['MANAGE_MESSAGES'])
    const embed = Utils.embed(msg)
      .setTitle('SubbyBot')
      .setDescription(
        'Thanks for showing interest in SubbyBot! Click the\nlink below to invite her to your server.'
      )
      .setThumbnail(client.user.avatarURL)
      .addField('\u200b', `[Click Here](${invite})`)

    return channel.send({ embed })
  }
}

module.exports = Invite
