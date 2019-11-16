const Command = require('../../core/Command')
const config = require('../../data/config')
const { prefix } = config.general

class KickUsers extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      category: 'Moderation',
      description: 'Kick em out',
      usage: `${prefix}kick <@username>`,
      aliases: [],
      args: true,
      guildOnly: true
    })
  }

  async run(msg, args, api) {
    if (msg.mentions.members.size === 0) {
      return msg.reply({ embed: { title: 'Please mention a user to kick' } }).then((msg) => {
        msg.delete(5000)
      })
    } else if (!msg.guild.me.hasPermission('KICK_MEMBERS')) {
      return msg
        .reply({ embed: { title: "I don't have permission to kick users" } })
        .then((msg) => {
          msg.delete(5000)
        })
    }

    const kickMember = msg.mentions.members.first()

    if (!args[1]) {
      return msg.reply({ embed: { title: 'Please put a reason for the kick' } }).then((msg) => {
        msg.delete(5000)
      })
    } else {
      kickMember.kick(args.join(' ')).then(async (member) => {
        await msg.reply({
          embed: { title: `${member.user.username} was succesfully kicked.` }
        })
      })
    }
  }
}
module.exports = KickUsers
