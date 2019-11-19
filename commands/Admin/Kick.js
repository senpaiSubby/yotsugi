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
    const { Utils } = client

    if (msg.mentions.members.size === 0) {
      return msg
        .reply(Utils.embed(msg, 'yellow').setDescription('Please mention a user to kick'))
        .then((m) => {
          m.delete(10000)
        })
    }

    const kickMember = msg.mentions.members.first()

    if (!args[1]) {
      return msg
        .reply(Utils.embed(msg, 'yellow').setDescription("Please put a reason for the kick'"))
        .then((m) => {
          m.delete(10000)
        })
    }
    kickMember.kick(args.join(' ')).then(async (member) => {
      return msg.reply(
        Utils.embed(msg, 'yellow').setDescription(`${member.user.username} was succesfully kicked.`)
      )
    })
  }
}
module.exports = KickUsers
