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
 * Set and automatically run commands at set times
 */
export default class AutoRun extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Bot Utils',
      description: 'Autorun commands at specified times',
      name: 'autorun',
      ownerOnly: true,
      usage: [
        'autorun list',
        'autorun add [time ex: 10:15pm> [command]',
        'autorun remove [time ex: 10:15pm] [command]',
        'autorun add [time ex: 10:15pm]',
        'autorun [time ex: 10:15pm]',
        'autorun disable [time ex: 10:15pm] [command]',
        'autorun enable [time ex: 10:15pm] [command]',
        'autorun changetime [time ex: 10:15pm] [new name]'
      ],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: string[]) {
    // * ------------------ Setup --------------------

    const { validOptions, warningMessage, standardMessage, embed, paginate } = Utils

    // * ------------------ Config --------------------

    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { autorun } = config

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    // Command setup
    switch (args[0]) {
      case 'changetime': {
        const taskTime = args[1]
        const newTime = args[2]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Check for new name
        if (!newTime) {
          return warningMessage(msg, `Please specify the time for autorun [ ${newTime} ]`)
        }

        // Check if autorun exists
        if (timeIndex === -1) {
          return warningMessage(msg, `[ ${taskTime} ] autorun at doesn't exist`)
        }

        // Rename autorun
        autorun[timeIndex].time = newTime

        // Save changes
        await db.update({ config: JSON.stringify(config) })
        await standardMessage(msg, 'green', `Retimed [ ${taskTime} ] autorun to [ ${newTime} ]`)
        return process.exit()
      }

      case 'enable': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Check if autorun exists
        if (timeIndex === -1) {
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        // Check if user specified command
        if (!args[2]) {
          return warningMessage(msg, `Please specify the command # in [ ${taskTime} ] autorun to enable`)
        }

        const command = (args[2] as any) - 1

        // Get index of individual command list
        const foundCommand = autorun[timeIndex].commands[command]

        // Check if command exists
        if (!foundCommand) {
          return warningMessage(msg, `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`)
        }

        // Check current status
        const isEnabled = autorun[timeIndex].commands[command].enabled
        if (isEnabled) {
          return warningMessage(
            msg,
            `Command [ ${foundCommand.command} ] in [ ${taskTime} ] autorun is already enabled`
          )
        }
        // Enable command in autorun
        foundCommand.enabled = true

        // Save changes
        await db.update({ config: JSON.stringify(config) })

        await standardMessage(msg, 'green', `Enabled command [ ${foundCommand.command} ] in [ ${taskTime} ] autorun`)
        return process.exit()
      }

      case 'disable': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Check if autorun exists
        if (timeIndex === -1) {
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        // Check if user specified command
        if (!args[2]) {
          return warningMessage(msg, `Please specify the command # in [ ${taskTime} ] autorun to disable`)
        }

        const command = (args[2] as any) - 1

        // Get index of individual command list
        const foundCommand = autorun[timeIndex].commands[command]

        // Check if command exists
        if (!foundCommand) {
          return warningMessage(msg, `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`)
        }

        // Check current status
        const isEnabled = autorun[timeIndex].commands[command].enabled
        if (!isEnabled) {
          return warningMessage(
            msg,
            `Command [ ${foundCommand.command} ] in [ ${taskTime} ] autorun is already disabled`
          )
        }
        // Disable command in autorun
        foundCommand.enabled = false

        // Save changes
        await db.update({ config: JSON.stringify(config) })

        await standardMessage(
          msg,
          'green',
          `Disabled command  [ ${command + 1} ][ ${foundCommand.command} ] in [ ${taskTime} ] autorun`
        )
        return process.exit()
      }

      case 'list': {
        if (!autorun.length) {
          return warningMessage(msg, `There are no autoruns!`)
        }

        const embedList = []
        autorun.forEach((i) => {
          const { time, commands } = i

          const e = embed(msg, 'green', 'timer.png').setTitle(`autoruns - [ ${time} ]`)

          commands.forEach((c, index) => {
            const { enabled, command } = c
            const status = enabled ? ':green_square:' : ':red_square:'
            e.addField(`[ ${index + 1} ]`, `**${status} ${command}**`, true)
          })

          embedList.push(e)
        })
        return paginate(msg, embedList)
      }

      case 'add': {
        const taskTime = args[1]
        let index = autorun.findIndex((i: AutorunItem) => i.time === taskTime)

        args.splice(0, 2)
        const command = args.join(' ')

        if (!command) {
          return warningMessage(msg, `Please specify the command to add to the autorun`)
        }

        // Create autorun if doesnt exist
        if (index === -1) {
          autorun.push({
            time: taskTime,
            commands: [{ command, enabled: true }]
          })
          index = autorun.findIndex((i) => i.time === taskTime)
        }
        // Check if command is already part of autorun
        else if (autorun[index].commands.find((c) => c.command.toLowerCase() === command.toLowerCase())) {
          return warningMessage(msg, `[ ${taskTime} ] autorun already has command [ ${command} ]`)
        } else {
          autorun[index].commands.push({ command, enabled: true })
        }

        // Save changes
        await db.update({ config: JSON.stringify(config) })

        await standardMessage(msg, 'green', `Added command [ ${command} ] to [ ${taskTime} ] autorun`)

        return process.exit()
      }

      case 'remove': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // Create autorun if doesnt exist
        if (timeIndex === -1) {
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        if (args[2]) {
          args.splice(0, 2)
          const command = args.join(' ')

          // Get index of individual command
          const commandIndex = autorun[timeIndex].commands.findIndex(
            (i) => i.command.toLowerCase() === command.toLowerCase()
          )

          // Check if command exists
          if (
            commandIndex === -1 ||
            autorun[timeIndex].commands[commandIndex].command.toLowerCase() !== command.toLowerCase()
          ) {
            return warningMessage(msg, `[ ${taskTime} ] autorun doesnt contain command [ ${command} ]`)
          }

          // Remove command from autorun
          autorun[timeIndex].commands.splice(commandIndex, 1)
          await db.update({ config: JSON.stringify(config) })

          await standardMessage(msg, 'green', `Removed command [ ${command} ] from [ ${taskTime} ] autorun`)
          return process.exit()
        }

        // Save changes
        autorun.splice(timeIndex, 1)
        await db.update({ config: JSON.stringify(config) })
        await standardMessage(msg, 'green', `Removed [ ${taskTime} ] autorun`)
        return process.exit()
      }

      default:
        return validOptions(msg, ['list', 'add', 'remove', 'changetime', 'disable', 'enable'])
    }
  }
}
