/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { serverConfig } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class Level extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'resetlevel',
      category: 'Admin Tools',
      description: 'Reset a members level',
      usage: ['resetlevel <user>'],
      permsNeeded: ['MANAGE_ROLES_OR_PERMISSIONS']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage) {
    // * ------------------ Setup --------------------

    const { standardMessage, warningMessage } = client.Utils
    const { guild, mentions } = msg

    // * ------------------ Config --------------------

    const db = await serverConfig(guild.id)

    const memberLevels = JSON.parse(db.get('memberLevels') as string)
    const { levels } = memberLevels

    const user = mentions.members.first()
    if (!user) return warningMessage(msg, 'Please specifiy the member to reset')

    // * ------------------ Logic --------------------

    levels[user.user.id] = { level: 1, exp: 0, expTillNextLevel: 199 }

    await db.update({ memberLevels: JSON.stringify(memberLevels) })

    return standardMessage(
      msg,
      'green',
      `Reset member [ ${user.user.tag} ] to level 1`
    )
  }
}
