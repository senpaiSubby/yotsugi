/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Announce messages to the server
 */
export default class RoleInfo extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'roleinfo',
      category: 'Information',
      description: 'Gets info on the specified role',
      usage: ['roleinfo <role name>'],
      guildOnly: true,
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { warningMessage, embed } = Utils
    const { guild } = msg

    // * ------------------ Logic --------------------

    const role = guild.roles.find(
      (r) => r.name.toLowerCase() === args.join(' ').toLowerCase()
    )

    if (role) {
      const memberNames = role.members.map((r) => r.user.username).sort()

      return msg.channel.send(
        embed(msg)
          .setTitle(`Role [ ${args.join(' ')} ]`)
          .addField('Role ID', role.id)
          .addField(`Members [${memberNames.length}]`, memberNames.join('\n'))
          .setThumbnail(guild.iconURL)
          .setColor(role.hexColor)
      )
    }

    return warningMessage(msg, `Role [ ${args.join(' ')} ] doesn't exist.`)
  }
}
