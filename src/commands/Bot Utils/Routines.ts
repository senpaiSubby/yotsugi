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
 * Command to allow you to setup a shortcut to run multiple commands one after another
 */
export default class Routines extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['r'],
      args: true,
      category: 'Bot Utils',
      description: 'Run multiple commands as routines',
      name: 'routine',
      ownerOnly: true,
      usage: [
        'r list',
        'r run [routine name]',
        'r add [routine name> [command]',
        'r remove [routine name> [command]',
        'r add [routine name]',
        'r disable [routine name> [command]',
        'r enable [routine name> [command]',
        'r rename [routine name] [new name]'
      ],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { validOptions, warningMessage, errorMessage, standardMessage, embed, paginate, asyncForEach } = Utils

    // * ------------------ Config --------------------

    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { routines } = config

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    // Command setup
    switch (args[0]) {
      case 'rename': {
        const routineName = args[1]
        const newName = args[2]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // Check if routine exists
        if (routineIndex === -1) {
          return warningMessage(msg, `Routine [ ${routineName} ] doesn't exist`)
        }

        // Check for new name
        if (!newName) {
          return warningMessage(msg, `Please specify the name for routine [ ${newName} ]`)
        }

        // Rename routine
        routines[routineIndex].name = newName

        // Save changes
        await db.update({ config: JSON.stringify(config) })
        return standardMessage(msg, 'green', `Renamed routine [ ${routineName} ] to [ ${newName} ]`)
      }

      case 'enable': {
        const routineName = args[1]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // Check if routine exists
        if (routineIndex === -1) {
          return warningMessage(msg, `Routine [ ${routineName} ] doesn't exist`)
        }

        // Check if user specified command
        if (!args[2]) {
          return warningMessage(msg, `Please specify the command # in routine [ ${routineName} ] to enable`)
        }

        const command = args[2] - 1

        // Get index of individual command list
        const commandListIndex = routines[routineIndex].commands[command]

        // Check if command exists
        if (!commandListIndex) {
          return warningMessage(msg, `Routine [ ${routineName} ] doesnt contain comamnd # [ ${command} ]`)
        }

        // Check current status
        const status = routines[routineIndex].commands[command]
        if (status[0]) {
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${commandListIndex[1]} ] in routine [ ${routineName} ] is already enabled`
          )
        }
        // Enable command in routine
        commandListIndex[0] = true

        // Save changes
        await db.update({ config: JSON.stringify(config) })

        return standardMessage(
          msg,
          'green',
          `Enabled command  [ ${command + 1} ] [ ${commandListIndex[1]} ] in routine [ ${routineName} ]`
        )
      }

      case 'disable': {
        const routineName = args[1]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // Check if routine exists
        if (routineIndex === -1) {
          return warningMessage(msg, `Routine [ ${routineName} ] doesn't exist`)
        }

        // Check if user specified command
        if (!args[2]) {
          return warningMessage(msg, `Please specify the command # in routine [ ${routineName} ] to disable`)
        }

        const command = args[2] - 1

        // Get index of individual command list
        const commandListIndex = routines[routineIndex].commands[command]

        // Check if command exists
        if (!commandListIndex) {
          return warningMessage(msg, `Routine [ ${routineName} ] doesnt contain comamnd # [ ${command} ]`)
        }

        // Check current status
        const status = routines[routineIndex].commands[command]
        if (!status[0]) {
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${commandListIndex[1]} ] in routine [ ${routineName} ] is already disabled`
          )
        }
        // Disable command in routine
        commandListIndex[0] = false

        // Save changes
        await db.update({ config: JSON.stringify(config) })

        return standardMessage(
          msg,
          'green',
          `Disabled command  [ ${command + 1} ][ ${commandListIndex[1]} ] in routine [ ${routineName} ]`
        )
      }

      case 'run': {
        const routineName = args[1]
        const index = routines.findIndex((i) => i.name === routineName)

        if (index === -1) {
          return warningMessage(msg, `Routine [ ${routineName} ] doesn't exist`)
        }

        const failedCommands = []
        await asyncForEach(routines[index].commands, async (i) => {
          const params = i[1].split(' ')

          // If command is enabled then run
          if (i[0]) {
            const commandName = params.shift().toLowerCase()
            const cmd = msg.context.findCommand(commandName)
            if (cmd) {
              await msg.context.runCommand(client, cmd, msg, params)
            } else {
              failedCommands.push(commandName)
            }
          }
        })

        if (failedCommands.length) {
          return errorMessage(msg, `Commands [ ${failedCommands.join(', ')} ] dont exist`)
        }
        break
      }

      case 'list': {
        if (!routines.length) {
          return warningMessage(msg, `There are no routines!`)
        }

        const embedList = []
        routines.forEach((i) => {
          const e = embed(msg, 'green', 'routine.png').setTitle(`Routines - [ ${i.name} ]`)
          i.commands.forEach((c, index) => {
            const status = c[0] ? ':green_square:' : ':red_square:'
            e.addField(`[ ${index + 1} ]`, `**${status} ${c[1]}**`, true)
          })

          embedList.push(e)
        })
        return paginate(msg, embedList)
      }

      case 'add': {
        const routineName = args[1]
        let index = routines.findIndex((i) => i.name === routineName)

        args.splice(0, 2)
        const command = args.join(' ')

        // Create routine if doesnt exist
        if (index === -1) {
          routines.push({ name: routineName, commands: [] })
          index = routines.findIndex((i) => i.name === routineName)
        }

        if (!command) {
          return warningMessage(msg, `Please specify the command to add to the routine`)
        }

        // Check if command is already part of routine
        if (routines[index].commands.includes(command)) {
          return warningMessage(msg, `Routine [ ${routineName} ] already has comamnd [ ${command} ]`)
        }

        // Save changes
        routines[index].commands.push([true, command])
        await db.update({ config: JSON.stringify(config) })

        return standardMessage(msg, 'green', `Added command [ ${command} ] to routine [ ${routineName} ]`)
      }

      case 'remove': {
        const routineName = args[1]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // Create routine if doesnt exist
        if (routineIndex === -1) {
          return warningMessage(msg, `Routine [ ${routineName} ] doesn't exist`)
        }

        if (args[2]) {
          args.splice(0, 2)
          const command = args.join(' ')

          // Get index of individual command list
          const commandListIndex = routines[routineIndex].commands.findIndex((i) => i[1] === command)
          // Check if command exists
          if (!routines[routineIndex].commands[commandListIndex].includes(command)) {
            return warningMessage(msg, `Routine [ ${routineName} ] doesnt contain comamnd [ ${command} ]`)
          }
          // Remove command from routine
          const commandIndex = routines[routineIndex].commands.findIndex((i) => i === command)
          // Save changes
          routines[routineIndex].commands.splice(commandIndex, 1)
          await db.update({ config: JSON.stringify(config) })

          return standardMessage(msg, 'green', `Removed command [ ${command} ] from routine [ ${routineName} ]`)
        }

        // Save changes
        routines.splice(routineIndex, 1)
        await db.update({ config: JSON.stringify(config) })
        return standardMessage(msg, 'green', `Removed routine [ ${routineName} ]`)
      }

      default:
        return validOptions(msg, ['add', 'remove', 'run', 'rename', 'disable', 'enable'])
    }
  }
}
