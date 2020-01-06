/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Remove roles from users
 */
export default class RemoveRole extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'removerole',
      category: 'Admin',
      description: 'Remove roles from members',
      usage: ['removerole @user rolename'],
      permsNeeded: ['MANAGE_ROLES'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, errorMessage, embed } = client.Utils

    // * ------------------ Logic --------------------

    // Member we will remove the role from
    const rMember = msg.guild.member(msg.mentions.users.first() || msg.guild.members.get(args[0]))

    // If no member specified then notify
    if (!rMember) return errorMessage(msg, `No user given or Invalid user given`)

    // Set target role
    const role = args[1]

    // If user doesnt specify role then notify
    if (!role) return msg.reply('Please specify a role')

    // Check for and find role in guild
    const gRole = msg.guild.roles.find((a) => a.name.toLowerCase() === role.toLowerCase())

    // If role doesnt exist notify
    if (!gRole) return errorMessage(msg, `Role doesn't exist`)

    // If the user doesnt have the role we want to remove
    if (!rMember.roles.has(gRole.id)) {
      return warningMessage(msg, `${rMember} doesn't have the role [ ${role} ]`)
    }

    // Else remove role from user
    await rMember.removeRole(gRole.id)

    // Try to DM target user that the role has been removed
    // If they have guild DM's turned off then this will fail
    try {
      await rMember.send(
        embed('yellow').setDescription(
          `**You have been removed from the role [ ${gRole.name} ] in [ ${msg.guild.name} ]**`
        )
      )
      // Notify that the role has been removed from the user
      return warningMessage(
        msg,
        `<@${rMember.id}> They have been removed from the role ${gRole.name}
        I tried to DM them but their DMs are locked`
      )
    } catch {
      // Notify that the role has been removed from the user
      return warningMessage(
        msg,
        `<@${rMember.id}> They have been removed from the role ${gRole.name}
        I tried to DM them but their DMs are locked`
      )
    }
  }
}
