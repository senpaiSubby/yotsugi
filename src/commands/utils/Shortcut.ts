/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { generalConfig } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class Shortcut extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'shortcut',
      aliases: ['s'],
      category: 'Utils',
      usage: ['s list', 's add <name> <command>', 's remove <name>'],
      description: 'Shortcut to run specific commands',
      args: true,
      ownerOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { warningMessage, standardMessage, errorMessage, embed } = Utils
    const { author, context, channel } = msg

    // * ------------------ Config --------------------

    const db = await generalConfig(author.id)
    const { config } = client.db
    const { shortcuts } = config

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        if (!shortcuts.length) return warningMessage(msg, `There are no shortcuts!`)

        const e = embed('green', 'shortcut.png').setTitle('Shortcuts')
        shortcuts.forEach((i) => e.addField(`${i.name}`, `${i.command} ${i.arg.join(' ')}`), true)
        return channel.send(e)
      }
      case 'add': {
        const name = args[1]
        const command = args[2]
        const index = shortcuts.findIndex((i) => i.name === name)

        if (index > -1) return warningMessage(msg, `Shortcut [ ${name} ] already exists`)

        args.splice(0, 3)
        const arg = args.join(' ')
        shortcuts.push({ name, command, arg: arg.split(' ') })
        await db.update({ config: JSON.stringify(config) })
        return standardMessage(msg, `[ ${name} ] added to shortcut list`)
      }
      case 'remove': {
        const name = args[1]
        const index = shortcuts.findIndex((d) => d.name === name)
        if (index === -1) return warningMessage(msg, `Shortcut [ ${name} ] doesn't exist`)

        shortcuts.splice(index, 1)
        await db.update({ config: JSON.stringify(config) })
        if (name) return standardMessage(msg, `[ ${name} ] removed from shortcut list`)

        break
      }
      default: {
        const index = shortcuts.findIndex((i) => i.name === args[0])
        if (index === -1) return warningMessage(msg, `Shortcut doesn't exist`)

        const { command, arg } = shortcuts[index]

        const cmd = context.findCommand(command)
        if (cmd) return context.runCommand(client, cmd, msg, arg)
        return errorMessage(msg, `Command [ ${command} ] doesn't exist`)
      }
    }
  }
}
