/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

/**
 * Command to set shortcuts to other commands
 */
export default class Shortcut extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['s'],
      args: true,
      category: 'Utils',
      description: 'Make and run shortcuts to other commands',
      name: 'shortcut',
      ownerOnly: true,
      usage: ['s list', 's add [name] [command]', 's remove [name]', 's run [shortcut name]']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, standardMessage, errorMessage, embed, validOptions } = Utils
    const { author, context, channel } = msg

    const db = await database.models.Configs.findOne({ where: { id: author.id } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { shortcuts } = config

    const param = args.shift()
    switch (param) {
      case 'list': {
        if (!shortcuts.length) {
          return warningMessage(msg, `There are no shortcuts!`)
        }

        const e = embed(msg, 'green', 'shortcut.png').setTitle('Shortcuts')
        shortcuts.forEach((i) => e.addField(`${i.name}`, `${i.command} ${i.arg.join(' ')}`), true)
        return channel.send(e)
      }
      case 'add': {
        const name = args[0]
        const command = args[1]
        const index = shortcuts.findIndex((i) => i.name === name)

        if (index > -1) {
          return warningMessage(msg, `Shortcut [ ${name} ] already exists`)
        }

        args.splice(0, 2)
        const arg = args.join(' ')
        shortcuts.push({ name, command, arg: arg.split(' ') })
        await db.update({ config: JSON.stringify(config) })
        return standardMessage(msg, 'green', `[ ${name} ] added to shortcut list`)
      }
      case 'remove': {
        const name = args[0]
        const index = shortcuts.findIndex((d) => d.name === name)
        if (index === -1) {
          return warningMessage(msg, `Shortcut [ ${name} ] doesn't exist`)
        }

        shortcuts.splice(index, 1)
        await db.update({ config: JSON.stringify(config) })
        if (name) {
          return standardMessage(msg, 'green', `[ ${name} ] removed from shortcut list`)
        }

        break
      }
      case 'run': {
        const index = shortcuts.findIndex((i) => i.name === args[0])
        if (index === -1) return warningMessage(msg, `Shortcut doesn't exist`)

        const { command, arg } = shortcuts[index]

        const cmd = context.findCommand(command)
        if (cmd) return context.runCommand(client, cmd, msg, arg)
        return errorMessage(msg, `Command [ ${command} ] doesn't exist`)
      }
      default: {
        return validOptions(msg, ['add', 'remove', 'list', 'run'])
      }
    }
  }
}
