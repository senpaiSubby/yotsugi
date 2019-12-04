const Command = require('../../core/Command')

module.exports = class RemoveRole extends Command {
  constructor(client) {
    super(client, {
      name: 'removerole',
      category: 'Admin',
      description: 'Remove roles from members',
      usage: ['removerole @user rolename'],
      permsNeeded: ['MANAGE_ROLES'],
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { warningMessage, errorMessage, embed } = client.Utils

    // * ------------------ Logic --------------------

    const rMember = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]))
    if (!rMember) return errorMessage(msg, `No user given or Invalid user given`)

    args.shift()
    const role = args.join(' ')

    if (!role) return msg.reply('Please specify a role')
    const gRole = msg.guild.roles.find((a) => a.name === role)
    if (!gRole) return errorMessage(msg, `Role doesn't exist`)

    if (!rMember.roles.has(gRole.id)) {
      return warningMessage(msg, `${rMember} doesn't have the role [ ${role} ]`)
    }
    await rMember.removeRole(gRole.id)

    try {
      return rMember.send(
        embed('yellow').setDescription(
          `**You have been removed from the role [ ${gRole.name} ] in [ ${msg.guild.name} ]**`
        )
      )
    } catch (e) {
      return warningMessage(
        msg,
        `<@${rMember.id}> They have been removed from the role ${gRole.name}
        I tried to DM them but their DMs are locked`
      )
    }
  }
}
