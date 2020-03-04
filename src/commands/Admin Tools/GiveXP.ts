/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/base/Command'
import { serverConfig } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class Level extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'givexp',
      category: 'Admin Tools',
      description: 'Give XP to members',
      usage: ['givexp <user> <amount>'],
      permsNeeded: ['MANAGE_ROLES_OR_PERMISSIONS']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, standardMessage } = client.Utils
    const { guild, mentions } = msg

    // * ------------------ Config --------------------

    const db = await serverConfig(guild.id)

    const memberLevels = JSON.parse(db.get('memberLevels') as string)
    const { levels } = memberLevels

    const user = mentions.members.first()
    if (!user) return warningMessage(msg, 'Please specify a member to give EXP to')

    if (!levels[user.user.id]) levels[user.user.id] = { level: 0, exp: 0, expTillNextLevel: 0 }

    const member = levels[user.user.id]

    // * ------------------ Logic --------------------

    const serverDB = await serverConfig(guild.id)
    const { levelMultiplier } = JSON.parse(serverDB.get('config') as string) as ServerDBConfig
    args.shift()
    const xpToGive = Number(args[0])

    if (xpToGive > 100) return warningMessage(msg, 'You cannot give more that 100 XP')
    const totalXP = xpToGive + member.exp

    if (totalXP > member.expTillNextLevel) {
      if (member.expTillNextLevel - xpToGive <= 0) {
        member.exp = Math.abs(member.expTillNextLevel - xpToGive)
        member.level++
      } else {
        member.exp = totalXP
      }
    } else if (totalXP < member.expTillNextLevel) member.exp = totalXP

    member.expTillNextLevel = 100 * member.level * Number(levelMultiplier) - member.exp

    await db.update({ memberLevels: JSON.stringify(memberLevels) })
    return standardMessage(msg, 'green', `Gave [ ${xpToGive} xp ]`)
  }
}
