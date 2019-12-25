/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import { Role } from 'discord.js'

export default class AddRole extends Command {
  constructor(client: NezukoClient) {
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

  /**
   * Run this command
   * @param client Nezuko client
   * @param msg Original message
   * @param args Optional arguments
   */
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, errorMessage, embed } = client.Utils
    const { guild, mentions } = msg

    // * ------------------ Logic --------------------

    const rMember = guild.member(mentions.users.first() || guild.members.get(args[0]))
    if (!rMember) return errorMessage(msg, `No user given or Invalid user given`)

    args.shift()
    const role = args.join(' ')

    if (!role) return msg.reply('Please specify a role')
    const gRole = guild.roles.find((a: Role) => a.name === role)
    if (!gRole) return errorMessage(msg, `Role doesn't exist`)

    if (rMember.roles.has(gRole.id)) {
      return warningMessage(msg, `${rMember} already has the role [ ${role} ]`)
    }
    await rMember.addRole(gRole.id)

    try {
      return rMember.send(
        embed('green').setDescription(
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
