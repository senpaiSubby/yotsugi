/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
const Command = require('../../core/Command')

class KickUsers extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      category: 'Admin',
      description: 'Kick em out',
      usage: `kick <@username>`,
      guildOnly: true,
      args: true,
      permsNeeded: ['KICK_MEMBERS']
    })
  }

  async run(client, msg, args) {
    if (msg.mentions.members.size === 0) {
      return msg.reply({ embed: { title: 'Please mention a user to kick' } }).then((msg) => {
        msg.delete(5000)
      })
    }

    const kickMember = msg.mentions.members.first()

    if (!args[1]) {
      return msg.reply({ embed: { title: 'Please put a reason for the kick' } }).then((msg) => {
        msg.delete(5000)
      })
    }
    kickMember.kick(args.join(' ')).then(async (member) => {
      return msg.reply({
        embed: { title: `${member.user.username} was succesfully kicked.` }
      })
    })
  }
}
module.exports = KickUsers
