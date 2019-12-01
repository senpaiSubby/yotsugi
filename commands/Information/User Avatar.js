const Command = require('../../core/Command')

module.exports = class UserAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      category: 'Information',
      description: 'Show the avatar of users.',
      usage: [`avatar`, `avatar @user`],
      guildOnly: true
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { embed, warningMessage } = client.Utils
    const { author, channel } = msg

    // * ------------------ Logic --------------------

    const member = msg.mentions.members.first() || author
    if (!member.user.avatar) return warningMessage(msg, 'This user does not have an avatar!')
    const avatar = member.user.avatarURL

    return channel.send(
      embed('green')
        .setAuthor(`${member.user.tag}`, avatar)
        .setDescription(`[Avatar URL](${avatar})`)
        .setImage(avatar)
    )
  }
}
