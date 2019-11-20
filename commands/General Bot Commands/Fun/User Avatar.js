const Command = require('../../../core/Command')

class UserAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      category: 'Fun',
      description: 'Show the avatar of users.',
      usage: `avatar | avatar @user`,
      guildOnly: true
    })
  }

  async run(client, msg) {
    const { Utils } = client
    const { author, channel } = msg

    const member = msg.mentions.members.first() || author
    if (!member.user.avatar) return channel.send('This user does not have an avatar!')
    const avatar = member.user.avatarURL

    const embed = Utils.embed(msg)
      .setAuthor(`${member.user.tag}`, avatar)
      .setDescription(`[Avatar URL](${avatar})`)
      .setImage(avatar)
    return channel.send({ embed })
  }
}
module.exports = UserAvatar
