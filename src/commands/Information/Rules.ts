/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/Command'
import { NezukoClient } from '../../NezukoClient'

export default class Rules extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'rules',
      category: 'Information',
      description: 'Behold the rule book'
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, serverConfig } = client
    const { warningMessage, standardMessage, embed } = Utils
    const { member, guild } = msg

    // * ------------------ Check Config --------------------

    if (args[0]) {
      if (!member.permissions.has(['ADMINISTRATOR'])) {
        return warningMessage(msg, `You must have ['ADMINISTRATOR'] perms to ${args[0]} rules`)
      }
    }

    // * ------------------ Logic --------------------

    const rule = args.slice(1).join(' ')

    const db = await serverConfig.findOne({ where: { id: guild.id } })
    const { rules, logChannel, prefix } = JSON.parse(db.dataValues.config) as ServerDBConfig

    const serverLoggersChannel = msg.guild.channels.get(logChannel)

    if (!serverLoggersChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a Loggers channel.
        Please set one with \`${prefix}server set logChannel <channelID>\``
      )
    }

    switch (args[0]) {
      case 'add': {
        rules.push(rule)
        await db.update({ rules: JSON.stringify(rules) })
        return standardMessage(msg, `[ ${rule} ] added to rules`)
      }
      case 'remove': {
        const item = args[1] - 1
        const name = rules[item]
        rules.splice(item, 1)
        await db.update({ rules: JSON.stringify(rules) })
        if (name) return standardMessage(msg, `[ ${name} ] removed from rules`)

        return warningMessage(msg, `Rule [ ${name} ] doesn't exist`)
      }
      default: {
        if (!rules.length) {
          return msg.reply(
            embed('yellow')
              .setTitle(`There are no rules!`)
              .setDescription(`\`${prefix}rules add <rule to add>\`\nTo add some!`)
          )
        }

        let ruleList = ''
        rules.forEach((i, index) => (ruleList += `${index + 1} | ${i}\n`))
        return msg.reply(
          embed('green')
            .setTitle('Rules')
            .setDescription(ruleList)
        )
      }
    }
  }
}
