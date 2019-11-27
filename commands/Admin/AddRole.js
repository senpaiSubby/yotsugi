const Command = require('../../core/Command')

module.exports = class AddRole extends Command {
  constructor(client) {
    super(client, {
      name: 'addrole',
      category: 'Admin',
      description: 'Add roles to members',
      usage: ['addrole <@user> <rolename>'],
      aliases: ['arole'],
      permsNeeded: ['MANAGE_ROLES'],
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { warningMessage, errorMessage, embed } = client.Utils
    const { guild, mentions } = msg

    // * ------------------ Logic --------------------

    const rMember = guild.member(mentions.users.first() || guild.members.get(args[0]))
    if (!rMember) return errorMessage(msg, `No user given or Invalid user given`)

    args.shift()
    const role = args.join(' ')

    if (!role) return msg.reply('Please specify a role')
    const gRole = guild.roles.find((a) => a.name === role)
    if (!gRole) return errorMessage(msg, `Role does not exist`)

    if (rMember.roles.has(gRole.id)) {
      return warningMessage(msg, `${rMember} already has the role [ ${role} ]`)
    }
    await rMember.addRole(gRole.id)

    try {
      return rMember.send(
        embed(msg).setDescription(
          `**You have been given the role [ ${gRole.name} ] in [ ${msg.guild.name} ]**`
        )
      )
    } catch (e) {
      return warningMessage(
        msg,
        `<@${rMember.id}> They have been given the role ${gRole.name} \
        I tried to DM them but their DMs are locked`
      )
    }
  }
}
