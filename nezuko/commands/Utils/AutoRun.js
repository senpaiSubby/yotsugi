const Command = require('../../core/Command')

module.exports = class AutoRun extends Command {
  constructor(client) {
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

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { Utils, generalConfig } = client
    const { validOptions, warningMessage, standardMessage, embed, paginate } = Utils

    // * ------------------ Config --------------------

    const db = await generalConfig.findOne({ where: { id: client.config.ownerID } })
    const { config } = client.db
    const { autorun } = config

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    // command setup
    switch (args[0]) {
      case 'changetime': {
        const taskTime = args[1]
        const newTime = args[2]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // check if autorun exists
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun at doesn't exist`)
        }

        // check for new name
        if (!newTime) {
          if (api) return `Please specify the time for autorun [ ${newTime} ]`
          return warningMessage(msg, `Please specify the time for autorun [ ${newTime} ]`)
        }

        // rename autorun
        autorun[timeIndex].time = newTime

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Retimed [ ${taskTime} ] autorun to [ ${newTime} ]`
        await standardMessage(msg, `Retimed [ ${taskTime} ] autorun to [ ${newTime} ]`)
        return process.exit()
      }

      case 'enable': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // check if autorun exists
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in [ ${taskTime} ] autorun to enable`
          }
          return warningMessage(
            msg,
            `Please specify the command # in [ ${taskTime} ] autorun to enable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = autorun[timeIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) {
            return `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`
          }
          return warningMessage(
            msg,
            `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`
          )
        }

        // check current status
        const status = autorun[timeIndex].commands[command]
        if (status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in [ ${taskTime} ] autorun is already enabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in [ ${taskTime} ] autorun is already enabled`
          )
        }
        // enable command in autorun
        commandListIndex[0] = true

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in autorun at[ ${taskTime} ]`
        }
        await standardMessage(
          msg,
          `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in [ ${taskTime} ] autorun`
        )
        return process.exit()
      }

      case 'disable': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // check if autorun exists
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in [ ${taskTime} ] autorun to disable`
          }
          return warningMessage(
            msg,
            `Please specify the command # in [ ${taskTime} ] autorun to disable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = autorun[timeIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) {
            return `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`
          }
          return warningMessage(
            msg,
            `[ ${taskTime} ] autorun doesnt contain command # [ ${command} ]`
          )
        }

        // check current status
        const status = autorun[timeIndex].commands[command]
        if (!status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in [ ${taskTime} ] autorun is already disabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in [ ${taskTime} ] autorun is already disabled`
          )
        }
        // disable command in autorun
        commandListIndex[0] = false

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in [ ${taskTime} ] autorun`
        }
        await standardMessage(
          msg,
          `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in [ ${taskTime} ] autorun`
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
          const e = embed('green', 'timer.png').setTitle(`autoruns - [ ${i.time} ]`)
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

        // create autorun if doesnt exist
        if (index === -1) {
          autorun.push({ time: taskTime, commands: [] })
          index = autorun.findIndex((i) => i.time === taskTime)
        }

        if (!command) {
          if (api) return `Please specify the command to add to the autorun`
          return warningMessage(msg, `Please specify the command to add to the autorun`)
        }

        // check if command is already part of autorun
        if (autorun[index].commands.includes(command)) {
          if (api) return `[ ${taskTime} ] autorun already has command [ ${command} ]`
          return warningMessage(msg, `[ ${taskTime} ] autorun already has command [ ${command} ]`)
        }

        // save changes
        autorun[index].commands.push([true, command])
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Added command [ ${command} ] to [ ${taskTime} ] autorun`
        await standardMessage(msg, `Added command [ ${command} ] to [ ${taskTime} ] autorun`)
        return process.exit()
      }

      case 'remove': {
        const taskTime = args[1]
        const timeIndex = autorun.findIndex((i) => i.time === taskTime)

        // create autorun if doesnt exist
        if (timeIndex === -1) {
          if (api) return `[ ${taskTime} ] autorun doesn't exist`
          return warningMessage(msg, `[ ${taskTime} ] autorun doesn't exist`)
        }

        if (args[2]) {
          args.splice(0, 2)
          const command = args.join(' ')

          // get index of individual command list
          const commandListIndex = autorun[timeIndex].commands.findIndex((i) => i[1] === command)
          // check if command exists
          if (!autorun[timeIndex].commands[commandListIndex].includes(command)) {
            if (api) {
              return `[ ${taskTime} ] autorun doesnt contain command [ ${command} ]`
            }
            return warningMessage(
              msg,
              `[ ${taskTime} ] autorun doesnt contain command [ ${command} ]`
            )
          }
          // remove command from autorun
          const commandIndex = autorun[timeIndex].commands.findIndex((i) => i === command)
          // save changes
          autorun[timeIndex].commands.splice(commandIndex, 1)
          await db.update({ config: JSON.stringify(config) })
          if (api) return `Removed command [ ${command} ] from [ ${taskTime} ] autorun`
          await standardMessage(msg, `Removed command [ ${command} ] from [ ${taskTime} ] autorun`)
          return process.exit()
        }

        // save changes
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
