const Command = require('../../core/Command')

class UserAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      category: 'Fun',
      description: 'Show the avatar of users.',
      usage: [`avatar`, `avatar @user`],
      guildOnly: true
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { embed } = Utils
    const { author, channel } = msg

    // * ------------------ Logic --------------------

    const member = msg.mentions.members.first() || author
    if (!member.user.avatar) return channel.send('This user does not have an avatar!')
    const avatar = member.user.avatarURL

    return channel.send(
      embed(msg)
        .setAuthor(`${member.user.tag}`, avatar)
        .setDescription(`[Avatar URL](${avatar})`)
        .setImage(avatar)
    )
  }
}
module.exports = UserAvatar
