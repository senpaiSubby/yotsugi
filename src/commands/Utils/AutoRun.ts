/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { generalConfig } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class AutoRun extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'autorun',
      category: 'Utils',
      description: 'Schedule tasks to run at specified times',
      usage: [
        'autorun list',
        'autorun add <time ex: 10:15pm> <command>',
        'autorun remove <time ex: 10:15pm> <command>',
        'autorun add <time ex: 10:15pm>',
        'autorun <time ex: 10:15pm>',
        'autorun disable <time ex: 10:15pm> <command>',
        'autorun enable <time ex: 10:15pm> <command>',
        'autorun changetime <time ex: 10:15pm> <new name>'
      ],
      ownerOnly: true,
      args: true,
      webUI: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: string[], api: boolean) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { validOptions, warningMessage, standardMessage, embed, paginate } = Utils

    // * ------------------ Config --------------------

    const db = await generalConfig(client.config.ownerID)
    const { config } = client.db
    const { autorun } = config as any

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    // Command setup
    switch (args[0]) {
      case 'changetime': {
        const taskTime = args[1]
        const newTime = args[2]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Check if autorun exists
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun at doesn't exist`)
        }

        // Check for new name
        if (!newTime) {
          if (api) return `Please specify the time for autorun [ ${newTime} ]`
          return warningMessage(msg, `Please specify the time for autorun [ ${newTime} ]`)
        }

        // Rename autorun
        autorun[timeIndex].time = newTime

        // Save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Retimed [ ${taskTime} ] autorun to [ ${newTime} ]`
        await standardMessage(msg, `Retimed [ ${taskTime} ] autorun to [ ${newTime} ]`)
        return process.exit()
      }

      case 'enable': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Check if autorun exists
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        // Check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in [ ${taskTime} ] autorun to enable`
          }
          return warningMessage(msg, `Please specify the command # in [ ${taskTime} ] autorun to enable`)
        }

        const command = (args[2] as any) - 1

        // Get index of individual command list
        const commandListIndex = autorun[timeIndex].commands[command]

        // Check if command exists
        if (!commandListIndex) {
          if (api) {
            return `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`
          }
          return warningMessage(msg, `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`)
        }

        // Check current status
        const status = autorun[timeIndex].commands[command]
        if (status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${commandListIndex[1]} ] in [ ${taskTime} ] autorun is already enabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${commandListIndex[1]} ] in [ ${taskTime} ] autorun is already enabled`
          )
        }
        // Enable command in autorun
        commandListIndex[0] = true

        // Save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Enabled command  [ ${command + 1} ] [ ${commandListIndex[1]} ] in autorun at[ ${taskTime} ]`
        }
        await standardMessage(
          msg,
          `Enabled command  [ ${command + 1} ] [ ${commandListIndex[1]} ] in [ ${taskTime} ] autorun`
        )
        return process.exit()
      }

      case 'disable': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Check if autorun exists
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        // Check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in [ ${taskTime} ] autorun to disable`
          }
          return warningMessage(msg, `Please specify the command # in [ ${taskTime} ] autorun to disable`)
        }

        const command = (args[2] as any) - 1

        // Get index of individual command list
        const commandListIndex = autorun[timeIndex].commands[command]

        // Check if command exists
        if (!commandListIndex) {
          if (api) {
            return `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`
          }
          return warningMessage(msg, `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`)
        }

        // Check current status
        const status = autorun[timeIndex].commands[command]
        if (!status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in [ ${taskTime} ] autorun is already disabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${commandListIndex[1]} ] in [ ${taskTime} ] autorun is already disabled`
          )
        }
        // Disable command in autorun
        commandListIndex[0] = false

        // Save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Disabled command  [ ${command + 1} ][ ${commandListIndex[1]} ] in [ ${taskTime} ] autorun`
        }
        await standardMessage(
          msg,
          `Disabled command  [ ${command + 1} ][ ${commandListIndex[1]} ] in [ ${taskTime} ] autorun`
        )
        return process.exit()
      }

      case 'list': {
        if (!autorun.length) {
          if (api) return `There are no autorun!`
          return warningMessage(msg, `There are no autoruns!`)
        }

        const embedList = []
        autorun.forEach((i) => {
          const e = embed(msg, 'green', 'timer.png').setTitle(`autoruns - [ ${i.time} ]`)
          i.commands.forEach((c, index) => {
            const status = c[0] ? ':green_square:' : ':red_square:'
            e.addField(`[ ${index + 1} ]`, `**${status} ${c[1]}**`, true)
          })

          embedList.push(e)
        })
        return paginate(msg, embedList)
      }

      case 'add': {
        const taskTime = args[1]
        let index = autorun.findIndex((i) => i.time === taskTime)

        args.splice(0, 2)
        const command = args.join(' ')

        // Create autorun if doesnt exist
        if (index === -1) {
          autorun.push({ time: taskTime, commands: [true, command] })
          index = autorun.findIndex((i) => i.time === taskTime)
        }

        if (!command) {
          if (api) return `Please specify the command to add to the autorun`
          return warningMessage(msg, `Please specify the command to add to the autorun`)
        }

        // Check if command is already part of autorun
        if (autorun[index].commands.includes(command)) {
          if (api) return `[ ${taskTime} ] autorun already has command [ ${command} ]`
          return warningMessage(msg, `[ ${taskTime} ] autorun already has command [ ${command} ]`)
        }

        // Save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Added command [ ${command} ] to [ ${taskTime} ] autorun`
        await standardMessage(msg, `Added command [ ${command} ] to [ ${taskTime} ] autorun`)
        return process.exit()
      }

      case 'remove': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Create autorun if doesnt exist
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        if (args[2]) {
          args.splice(0, 2)
          const command = args.join(' ')

          // Get index of individual command list
          const commandListIndex = autorun[timeIndex].commands.findIndex((i) => i[1] === command)

          // Check if command exists

          if (!autorun[timeIndex].commands[commandListIndex].includes(command)) {
            if (api) return `[ ${taskTime} ] autorun doesnt contain command [ ${command} ]`

            return warningMessage(msg, `[ ${taskTime} ] autorun doesnt contain command [ ${command} ]`)
          }
          // Remove command from autorun
          const commandIndex = autorun[timeIndex].commands.findIndex((i) => i === command)
          // Save changes
          autorun[timeIndex].commands.splice(commandIndex, 1)
          await db.update({ config: JSON.stringify(config) })
          if (api) return `Removed command [ ${command} ] from [ ${taskTime} ] autorun`
          await standardMessage(msg, `Removed command [ ${command} ] from [ ${taskTime} ] autorun`)
          return process.exit()
        }

        // Save changes
        autorun.splice(timeIndex, 1)
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Removed [ ${taskTime} ] autorun`
        await standardMessage(msg, `Removed [ ${taskTime} ] autorun`)
        return process.exit()
      }

      default:
        return validOptions(msg, ['list', 'add', 'remove', 'changetime', 'disable', 'enable'])
    }
  }
}
