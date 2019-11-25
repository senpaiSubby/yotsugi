const Command = require('../../core/Command')

class AddRole extends Command {
  constructor(client) {
    super(client, {
      name: 'addrole',
      category: 'Admin',
      description: 'Add roles to members',
      usage: 'addrole @user rolename',
      aliases: ['arole'],
      permsNeeded: ['MANAGE_ROLES'],
      args: true
    })
  }

  async run(client, msg, args, api) {
    const { Utils } = client
    const { warningMessage, standardMessage, errorMessage } = Utils
    const { author, channel, guild, mentions } = msg

    const rMember = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]))
    if (!rMember) {
      return errorMessage(msg, `No user given or Invalid user given`)
    }

    args.shift()
    const role = args.join(' ')

    if (!role) return msg.reply('Please specify a role')
    const gRole = msg.guild.roles.find((a) => a.name === role)
    if (!gRole) {
      return errorMessage(msg, `Role does not exist`)
    }

    if (rMember.roles.has(gRole.id))
      return warningMessage(msg, `${rMember} already has the role [ ${role} ]`)
    await rMember.addRole(gRole.id)

    try {
      return rMember.send(
        Utils.embed(msg).setDescription(
          `**You have been given the role [ ${gRole.name} ] in [ ${msg.guild.name} ]**`
        )
      )
    } catch (e) {
      return warningMessage(
        msg,
        `<@${rMember.id}> They have been given the role ${gRole.name} I tried to DM them but their DMs are locked`
      )
    }
  }
}
module.exports = AddRole
