const Command = require('../../core/Command')

module.exports = class ScheduledTasks extends Command {
  constructor(client) {
    super(client, {
      name: 'autocmd',
      category: 'Utils',
      description: 'Schedule tasks to run at specified times',
      usage: [
        'autocmd list',
        'autocmd add <time ex: 10:15pm> <command>',
        'autocmd remove <time ex: 10:15pm> <command>',
        'autocmd add <time ex: 10:15pm>',
        'autocmd <time ex: 10:15pm>',
        'autocmd disable <time ex: 10:15pm> <command>',
        'autocmd enable <time ex: 10:15pm> <command>',
        'autocmd changetime <time ex: 10:15pm> <new name>'
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
    const { scheduledTasks } = config

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    // command setup
    switch (args[0]) {
      case 'changetime': {
        const taskTime = args[1]
        const newTime = args[2]
        const timeIndex = scheduledTasks.findIndex((i) => i.time === taskTime)

        // check if Scheduled Task exists
        if (timeIndex === -1) {
          if (api) return `Scheduled Task at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Scheduled Task at [ ${taskTime} ] does not exist`)
        }

        // check for new name
        if (!newTime) {
          if (api) return `Please specify the time for Scheduled Task [ ${newTime} ]`
          return warningMessage(msg, `Please specify the time for Scheduled Task [ ${newTime} ]`)
        }

        // rename Scheduled Task
        scheduledTasks[timeIndex].time = newTime

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Retimed Scheduled Task [ ${taskTime} ] to [ ${newTime} ]`
        await standardMessage(msg, `Retimed Scheduled Task [ ${taskTime} ] to [ ${newTime} ]`)
        return process.exit()
      }

      case 'enable': {
        const taskTime = args[1]
        const timeIndex = scheduledTasks.findIndex((i) => i.time === taskTime)

        // check if Scheduled Task exists
        if (timeIndex === -1) {
          if (api) return `Scheduled Task at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Scheduled Task at [ ${taskTime} ] does not exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in Scheduled Task at [ ${taskTime} ] to enable`
          }
          return warningMessage(
            msg,
            `Please specify the command # in Scheduled Task at [ ${taskTime} ] to enable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = scheduledTasks[timeIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) {
            return `Scheduled Task at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          }
          return warningMessage(
            msg,
            `Scheduled Task at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          )
        }

        // check current status
        const status = scheduledTasks[timeIndex].commands[command]
        if (status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Scheduled Task at [ ${taskTime} ] is already enabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Scheduled Task at [ ${taskTime} ] is already enabled`
          )
        }
        // enable command in Scheduled Task
        commandListIndex[0] = true

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in Scheduled Task at[ ${taskTime} ]`
        }
        await standardMessage(
          msg,
          `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in Scheduled Task at [ ${taskTime} ]`
        )
        return process.exit()
      }

      case 'disable': {
        const taskTime = args[1]
        const timeIndex = scheduledTasks.findIndex((i) => i.time === taskTime)

        // check if Scheduled Task exists
        if (timeIndex === -1) {
          if (api) return `Scheduled Task at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Scheduled Task at [ ${taskTime} ] does not exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in Scheduled Task at [ ${taskTime} ] to disable`
          }
          return warningMessage(
            msg,
            `Please specify the command # in Scheduled Task at [ ${taskTime} ] to disable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = scheduledTasks[timeIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) {
            return `Scheduled Task at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          }
          return warningMessage(
            msg,
            `Scheduled Task at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          )
        }

        // check current status
        const status = scheduledTasks[timeIndex].commands[command]
        if (!status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Scheduled Task at [ ${taskTime} ] is already disabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Scheduled Task at [ ${taskTime} ] is already disabled`
          )
        }
        // disable command in Scheduled Task
        commandListIndex[0] = false

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in Scheduled Task at [ ${taskTime} ]`
        }
        await standardMessage(
          msg,
          `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in Scheduled Task at [ ${taskTime} ]`
        )
        return process.exit()
      }

      case 'list': {
        if (!scheduledTasks.length) {
          if (api) return `There are no scheduledTasks!`
          return warningMessage(msg, `There are no Scheduled Tasks!`)
        }

        const embedList = []
        scheduledTasks.forEach((i) => {
          const e = embed(msg).setTitle(`Scheduled Tasks - [ ${i.time} ]`)
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
        let index = scheduledTasks.findIndex((i) => i.time === taskTime)

        args.splice(0, 2)
        const command = args.join(' ')

        // create Scheduled Task if doesnt exist
        if (index === -1) {
          scheduledTasks.push({ time: taskTime, commands: [] })
          index = scheduledTasks.findIndex((i) => i.time === taskTime)
        }

        if (!command) {
          if (api) return `Please specify the command to add to the Scheduled Task`
          return warningMessage(msg, `Please specify the command to add to the Scheduled Task`)
        }

        // check if command is already part of Scheduled Task
        if (scheduledTasks[index].commands.includes(command)) {
          if (api) return `Scheduled Task at [ ${taskTime} ] already has command [ ${command} ]`
          return warningMessage(
            msg,
            `Scheduled Task at [ ${taskTime} ] already has command [ ${command} ]`
          )
        }

        // save changes
        scheduledTasks[index].commands.push([true, command])
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Added command [ ${command} ] to Scheduled Task at [ ${taskTime} ]`
        await standardMessage(
          msg,
          `Added command [ ${command} ] to Scheduled Task at [ ${taskTime} ]`
        )
        return process.exit()
      }

      case 'remove': {
        const taskTime = args[1]
        const timeIndex = scheduledTasks.findIndex((i) => i.time === taskTime)

        // create Scheduled Task if doesnt exist
        if (timeIndex === -1) {
          if (api) return `Scheduled Task at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Scheduled Task at [ ${taskTime} ] does not exist`)
        }

        if (args[2]) {
          args.splice(0, 2)
          const command = args.join(' ')

          // get index of individual command list
          const commandListIndex = scheduledTasks[timeIndex].commands.findIndex(
            (i) => i[1] === command
          )
          // check if command exists
          if (!scheduledTasks[timeIndex].commands[commandListIndex].includes(command)) {
            if (api) {
              return `Scheduled Task at [ ${taskTime} ] doesnt contain command [ ${command} ]`
            }
            return warningMessage(
              msg,
              `Scheduled Task at [ ${taskTime} ] doesnt contain command [ ${command} ]`
            )
          }
          // remove command from Scheduled Task
          const commandIndex = scheduledTasks[timeIndex].commands.findIndex((i) => i === command)
          // save changes
          scheduledTasks[timeIndex].commands.splice(commandIndex, 1)
          await db.update({ config: JSON.stringify(config) })
          if (api) return `Removed command [ ${command} ] from Scheduled Task at [ ${taskTime} ]`
          await standardMessage(
            msg,
            `Removed command [ ${command} ] from Scheduled Task at [ ${taskTime} ]`
          )
          return process.exit()
        }

        // save changes
        scheduledTasks.splice(timeIndex, 1)
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Removed Scheduled Task at [ ${taskTime} ]`
        await standardMessage(msg, `Removed Scheduled Task at [ ${taskTime} ]`)
        return process.exit()
      }

      default:
        return validOptions(msg, ['list', 'add', 'remove', 'changetime', 'disable', 'enable'])
    }
  }
}
