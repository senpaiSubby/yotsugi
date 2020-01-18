/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class Roles extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'roles',
      category: 'Information',
      description: 'List the server roles',
      usage: ['roles set <your rule message>', 'roles remove', 'roles']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { warningMessage, standardMessage, embed } = Utils
    const { member, guild } = msg

    // * ------------------ Check Config --------------------

    if (args[0]) {
      if (!member.permissions.has(['MANAGE_GUILD'])) {
        return warningMessage(msg, `You must have ['MANAGE_GUILD'] perms to ${args[0]} rules`)
      }
    }

    // * ------------------ Logic --------------------

    const rule = args.slice(1).join(' ')

    const db = await database.models.Servers.findOne({ where: { id: guild.id } })
    const config = JSON.parse(db.get('config') as string) as ServerDBConfig

    if (!config.roles) config.roles = []

    const { rules, prefix } = config

    switch (args[0]) {
      case 'set': {
        config.rules = [rule]
        await db.update({ config: JSON.stringify(config) })
        return standardMessage(msg, 'green', `[ ${rule} ] added to role list`)
      }
      case 'remove': {
        config.rules = []
        await db.update({ config: JSON.stringify(config) })
        if (name) return standardMessage(msg, 'green', `[ ${name} ] removed from role list`)

        return warningMessage(msg, `Rule [ ${name} ] doesn't exist`)
      }
      default: {
        if (!rules.length) {
          return msg.reply(
            embed(msg, 'yellow')
              .setTitle(`There is no role info set!`)
              .setDescription(`\`${prefix}roles add <role message>\`\nTo add some!`)
          )
        }

        return msg.reply(
          embed(msg, 'green')
            .setTitle(':no_entry_sign::octagonal_sign::warning: Roles :warning::octagonal_sign::no_entry_sign:')
            .setDescription(rules[0])
        )
      }
    }
  }
}
