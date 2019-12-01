const Command = require('../../core/Command')

module.exports = class Routines extends Command {
  constructor(client) {
    super(client, {
      name: 'routine',
      category: 'Utils',
      description: 'Routines to run multiple commands at once',
      usage: [
        'r list',
        'r add <routine name> <command>',
        'r remove <routine name> <command>',
        'r add <routine name>',
        'r run <routine name>',
        'r disable <routine name> <command>',
        'r enable <routine name> <command>',
        'r rename <routine name> <new name>'
      ],
      aliases: ['r', 'routines'],
      ownerOnly: true,
      args: true,
      webUI: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { Utils, generalConfig } = client
    const { validOptions, warningMessage, errorMessage, standardMessage, embed, paginate } = Utils

    // * ------------------ Config --------------------

    const db = await generalConfig.findOne({ where: { id: client.config.ownerID } })
    const { config } = client.db
    const { routines } = config

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    // command setup
    switch (args[0]) {
      case 'rename': {
        const routineName = args[1]
        const newName = args[2]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // check if routine exists
        if (routineIndex === -1) {
          if (api) return `Routine [ ${routineName} ] does not exist`
          return warningMessage(msg, `Routine [ ${routineName} ] does not exist`)
        }

        // check for new name
        if (!newName) {
          if (api) return `Please specify the name for routine [ ${newName} ]`
          return warningMessage(msg, `Please specify the name for routine [ ${newName} ]`)
        }

        // rename routine
        routines[routineIndex].name = newName

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Renamed routine [ ${routineName} ] to [ ${newName} ]`
        return standardMessage(msg, `Renamed routine [ ${routineName} ] to [ ${newName} ]`)
      }

      case 'enable': {
        const routineName = args[1]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // check if routine exists
        if (routineIndex === -1) {
          if (api) return `Routine [ ${routineName} ] does not exist`
          return warningMessage(msg, `Routine [ ${routineName} ] does not exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) return `Please specify the command # in routine [ ${routineName} ] to enable`
          return warningMessage(
            msg,
            `Please specify the command # in routine [ ${routineName} ] to enable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = routines[routineIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) return `Routine [ ${routineName} ] doesnt contain comamnd # [ ${command} ]`
          return warningMessage(
            msg,
            `Routine [ ${routineName} ] doesnt contain comamnd # [ ${command} ]`
          )
        }

        // check current status
        const status = routines[routineIndex].commands[command]
        if (status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in routine [ ${routineName} ] is already enabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in routine [ ${routineName} ] is already enabled`
          )
        }
        // enable command in routine
        commandListIndex[0] = true

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in routine [ ${routineName} ]`
        }
        return standardMessage(
          msg,
          `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in routine [ ${routineName} ]`
        )
      }

      case 'disable': {
        const routineName = args[1]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // check if routine exists
        if (routineIndex === -1) {
          if (api) return `Routine [ ${routineName} ] does not exist`
          return warningMessage(msg, `Routine [ ${routineName} ] does not exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) return `Please specify the command # in routine [ ${routineName} ] to disable`
          return warningMessage(
            msg,
            `Please specify the command # in routine [ ${routineName} ] to disable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = routines[routineIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) return `Routine [ ${routineName} ] doesnt contain comamnd # [ ${command} ]`
          return warningMessage(
            msg,
            `Routine [ ${routineName} ] doesnt contain comamnd # [ ${command} ]`
          )
        }

        // check current status
        const status = routines[routineIndex].commands[command]
        if (!status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in routine [ ${routineName} ] is already disabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in routine [ ${routineName} ] is already disabled`
          )
        }
        // disable command in routine
        commandListIndex[0] = false

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in routine [ ${routineName} ]`
        }
        return standardMessage(
          msg,
          `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in routine [ ${routineName} ]`
        )
      }

      case 'run': {
        const routineName = args[1]
        const index = routines.findIndex((i) => i.name === routineName)

        if (index === -1) {
          if (api) return `Routine [ ${routineName} ] does not exist`
          return warningMessage(msg, `Routine [ ${routineName} ] does not exist`)
        }

        if (!api) await standardMessage(msg, `Running routine [ ${routineName} ]`)

        const failedCommands = []
        routines[index].commands.forEach(async (i) => {
          const params = i[1].split(' ')

          // if command is enabled then run
          if (i[0]) {
            const commandName = params.shift().toLowerCase()
            const cmd = msg.context.findCommand(commandName)
            if (cmd) {
              if (api) await msg.context.runCommand(client, cmd, null, params, true)
              else await msg.context.runCommand(client, cmd, msg, params)
            } else failedCommands.push(commandName)
          }
        })

        if (failedCommands.length) {
          if (api) return `Commands [ ${failedCommands.join(', ')} ] dont exist`
          return errorMessage(msg, `Commands [ ${failedCommands.join(', ')} ] dont exist`)
        }
        if (api) return `Running routine [ ${routineName} ]`
        break
      }

      case 'list': {
        if (!routines.length) {
          if (api) return `There are no routines!`
          return warningMessage(msg, `There are no routines!`)
        }

        const embedList = []
        routines.forEach((i) => {
          const e = embed('green', 'routine.png').setTitle(`Routines - [ ${i.name} ]`)
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

        // create routine if doesnt exist
        if (index === -1) {
          routines.push({ name: routineName, commands: [] })
          index = routines.findIndex((i) => i.name === routineName)
        }

        if (!command) {
          if (api) return `Please specify the command to add to the routine`
          return warningMessage(msg, `Please specify the command to add to the routine`)
        }

        // check if command is already part of routine
        if (routines[index].commands.includes(command)) {
          if (api) return `Routine [ ${routineName} ] already has comamnd [ ${command} ]`
          return warningMessage(
            msg,
            `Routine [ ${routineName} ] already has comamnd [ ${command} ]`
          )
        }

        // save changes
        routines[index].commands.push([true, command])
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Added command [ ${command} ] to routine [ ${routineName} ]`
        return standardMessage(msg, `Added command [ ${command} ] to routine [ ${routineName} ]`)
      }

      case 'remove': {
        const routineName = args[1]
        const routineIndex = routines.findIndex((i) => i.name === routineName)

        // create routine if doesnt exist
        if (routineIndex === -1) {
          if (api) return `Routine [ ${routineName} ] does not exist`
          return warningMessage(msg, `Routine [ ${routineName} ] does not exist`)
        }

        if (args[2]) {
          args.splice(0, 2)
          const command = args.join(' ')

          // get index of individual command list
          const commandListIndex = routines[routineIndex].commands.findIndex(
            (i) => i[1] === command
          )
          // check if command exists
          if (!routines[routineIndex].commands[commandListIndex].includes(command)) {
            if (api) return `Routine [ ${routineName} ] doesnt contain comamnd [ ${command} ]`
            return warningMessage(
              msg,
              `Routine [ ${routineName} ] doesnt contain comamnd [ ${command} ]`
            )
          }
          // remove command from routine
          const commandIndex = routines[routineIndex].commands.findIndex((i) => i === command)
          // save changes
          routines[routineIndex].commands.splice(commandIndex, 1)
          await db.update({ config: JSON.stringify(config) })
          if (api) return `Removed command [ ${command} ] from routine [ ${routineName} ]`
          return standardMessage(
            msg,
            `Removed command [ ${command} ] from routine [ ${routineName} ]`
          )
        }

        // save changes
        routines.splice(routineIndex, 1)
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Removed routine [ ${routineName} ]`
        return standardMessage(msg, `Removed routine [ ${routineName} ]`)
      }

      default:
        return validOptions(msg, ['add', 'remove', 'run', 'rename', 'disable', 'enable'])
    }
  }
}
