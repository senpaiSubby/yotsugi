const Command = require('../../core/Command')
const config = require('../../data/config')
const { prefix } = config.general

class UserAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      category: 'General',
      description: 'Show the avatar of users.',
      usage: `${prefix}avatar | ${prefix}avatar @user`,
      guildOnly: true
    })
  }

  async run(msg, args, api) {
    const member = msg.mentions.members.first() || msg.author
    if (!member.user.avatar) return msg.channel.send('This user does not have an avatar!')
    const avatar = member.user.avatarURL

    const embed = new Discord.RichEmbed()
      .setAuthor(`${member.user.tag}`, avatar)
      .setColor(member.displayHexColor ? member.displayHexColor : '#D0C7FF')
      .setDescription(`[Avatar URL](${avatar})`)
      .setImage(avatar)
    return msg.channel.send({ embed })
  }
}
module.exports = UserAvatar
