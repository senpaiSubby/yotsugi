/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Add roles to users
 */
export default class GiveRole extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'giverole',
      category: 'Admin',
      description: 'Give roles to members',
      usage: ['giverole <@user> <rolename>'],
      permsNeeded: ['MANAGE_ROLES'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, errorMessage, embed } = client.Utils
    const { guild, mentions } = msg

    // * ------------------ Logic --------------------

    // Get user to add role to
    const rMember = guild.member(mentions.users.first() || guild.members.get(args[0]))
    // If no target user warn user
    if (!rMember) return errorMessage(msg, `No user given or Invalid user given`)

    // Drop mentioned user from args
    args.shift()

    // Aggregate role from message
    const role = args.join(' ')
    if (!role) return msg.reply('Please specify a role')

    // Find the specified role
    const gRole = guild.roles.find((a) => a.name.toLowerCase() === role.toLowerCase())
    if (!gRole) return errorMessage(msg, `Role doesn't exist`)

    // Check if member already has the target role and
    // If not then assign role
    if (rMember.roles.has(gRole.id)) {
      return warningMessage(msg, `${rMember} already has the role [ ${role} ]`)
    }

    await rMember.addRole(gRole.id)

    // Attempt to DM the target member and if fails (user had DM's off)
    // Then notify in chat
    try {
      return rMember.send(
        embed('green').setDescription(`**You have been given the role [ ${gRole.name} ] in [ ${msg.guild.name} ]**`)
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
