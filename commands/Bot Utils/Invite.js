const { RichEmbed } = require('discord.js')
const Command = require('../../core/Command')

class Invite extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      category: 'Bot Utils',
      description: 'Invite Subby to your own server'
    })
  }

  async run(client, msg, args) {
    const invite = await client.generateInvite(['MANAGE_MESSAGES'])
    const embed = new RichEmbed()
      .setTitle('SubbyBot')
      .setDescription(
        'Thanks for showing interest in SubbyBot! Click the\nlink below to invite her to your server.'
      )
      .setThumbnail(client.user.avatarURL)
      .addField('\u200b', `[Click Here](${invite})`)

    return msg.channel.send({ embed })
  }
}

module.exports = Invite
