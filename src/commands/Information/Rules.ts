/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class Rules extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'rules',
      category: 'Information',
      description: 'Behold the rule book',
      usage: ['rules set <your rule message>', 'rules remove', 'rules']
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

    const db = await database.models.ServerConfig.findOne({ where: { id: guild.id } })
    const config = JSON.parse(db.get('config') as string) as ServerDBConfig
    const { rules, prefix } = config

    switch (args[0]) {
      case 'set': {
        config.rules = [rule]
        await db.update({ config: JSON.stringify(config) })
        return standardMessage(msg, `[ ${rule} ] added to rules`)
      }
      case 'remove': {
        config.rules = []
        await db.update({ config: JSON.stringify(config) })
        if (name) return standardMessage(msg, `[ ${name} ] removed from rules`)

        return warningMessage(msg, `Rule [ ${name} ] doesn't exist`)
      }
      default: {
        if (!rules.length) {
          return msg.reply(
            embed(msg, 'yellow')
              .setTitle(`There are no rules!`)
              .setDescription(`\`${prefix}rules add <rule to add>\`\nTo add some!`)
          )
        }

        return msg.reply(
          embed(msg, 'green')
            .setTitle(':no_entry_sign::octagonal_sign::warning: Rules :warning::octagonal_sign::no_entry_sign:')
            .setDescription(rules[0])
        )
      }
    }
  }
}
