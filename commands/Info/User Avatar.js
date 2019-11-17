/* eslint-disable class-methods-use-this */
const { RichEmbed } = require('discord.js')
const Command = require('../../core/Command')

class UserAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      category: 'Info',
      description: 'Show the avatar of users.',
      usage: `avatar | avatar @user`,
      guildOnly: true
    })
  }

  async run(client, msg) {
    const member = msg.mentions.members.first() || msg.author
    if (!member.user.avatar) return msg.channel.send('This user does not have an avatar!')
    const avatar = member.user.avatarURL

    const embed = new RichEmbed()
      .setAuthor(`${member.user.tag}`, avatar)
      .setColor(member.displayHexColor ? member.displayHexColor : '#D0C7FF')
      .setDescription(`[Avatar URL](${avatar})`)
      .setImage(avatar)
    return msg.channel.send({ embed })
  }
}
module.exports = UserAvatar
