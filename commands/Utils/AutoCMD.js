const Command = require('../../core/Command')

module.exports = class AutoCMD extends Command {
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
    const { autocmd } = config

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------

    // command setup
    switch (args[0]) {
      case 'changetime': {
        const taskTime = args[1]
        const newTime = args[2]
        const timeIndex = autocmd.findIndex((i) => i.time === taskTime)

        // check if Autocmd exists
        if (timeIndex === -1) {
          if (api) return `Autocmd at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Autocmd at [ ${taskTime} ] does not exist`)
        }

        // check for new name
        if (!newTime) {
          if (api) return `Please specify the time for Autocmd [ ${newTime} ]`
          return warningMessage(msg, `Please specify the time for Autocmd [ ${newTime} ]`)
        }

        // rename Autocmd
        autocmd[timeIndex].time = newTime

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Retimed Autocmd [ ${taskTime} ] to [ ${newTime} ]`
        await standardMessage(msg, `Retimed Autocmd [ ${taskTime} ] to [ ${newTime} ]`)
        return process.exit()
      }

      case 'enable': {
        const taskTime = args[1]
        const timeIndex = autocmd.findIndex((i) => i.time === taskTime)

        // check if Autocmd exists
        if (timeIndex === -1) {
          if (api) return `Autocmd at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Autocmd at [ ${taskTime} ] does not exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in Autocmd at [ ${taskTime} ] to enable`
          }
          return warningMessage(
            msg,
            `Please specify the command # in Autocmd at [ ${taskTime} ] to enable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = autocmd[timeIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) {
            return `Autocmd at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          }
          return warningMessage(
            msg,
            `Autocmd at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          )
        }

        // check current status
        const status = autocmd[timeIndex].commands[command]
        if (status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Autocmd at [ ${taskTime} ] is already enabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Autocmd at [ ${taskTime} ] is already enabled`
          )
        }
        // enable command in Autocmd
        commandListIndex[0] = true

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in Autocmd at[ ${taskTime} ]`
        }
        await standardMessage(
          msg,
          `Enabled command  [ ${command + 1} ] [ ${
            commandListIndex[1]
          } ] in Autocmd at [ ${taskTime} ]`
        )
        return process.exit()
      }

      case 'disable': {
        const taskTime = args[1]
        const timeIndex = autocmd.findIndex((i) => i.time === taskTime)

        // check if Autocmd exists
        if (timeIndex === -1) {
          if (api) return `Autocmd at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Autocmd at [ ${taskTime} ] does not exist`)
        }

        // check if user specified command
        if (!args[2]) {
          if (api) {
            return `Please specify the command # in Autocmd at [ ${taskTime} ] to disable`
          }
          return warningMessage(
            msg,
            `Please specify the command # in Autocmd at [ ${taskTime} ] to disable`
          )
        }

        const command = args[2] - 1

        // get index of individual command list
        const commandListIndex = autocmd[timeIndex].commands[command]

        // check if command exists
        if (!commandListIndex) {
          if (api) {
            return `Autocmd at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          }
          return warningMessage(
            msg,
            `Autocmd at [ ${taskTime} ] doesnt contain command # [ ${command} ]`
          )
        }

        // check current status
        const status = autocmd[timeIndex].commands[command]
        if (!status[0]) {
          if (api) {
            return `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Autocmd at [ ${taskTime} ] is already disabled`
          }
          return warningMessage(
            msg,
            `Command [ ${command + 1} ] [ ${
              commandListIndex[1]
            } ] in Autocmd at [ ${taskTime} ] is already disabled`
          )
        }
        // disable command in Autocmd
        commandListIndex[0] = false

        // save changes
        await db.update({ config: JSON.stringify(config) })
        if (api) {
          return `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in Autocmd at [ ${taskTime} ]`
        }
        await standardMessage(
          msg,
          `Disabled command  [ ${command + 1} ][ ${
            commandListIndex[1]
          } ] in Autocmd at [ ${taskTime} ]`
        )
        return process.exit()
      }

      case 'list': {
        if (!autocmd.length) {
          if (api) return `There are no autocmd!`
          return warningMessage(msg, `There are no Autocmds!`)
        }

        const embedList = []
        autocmd.forEach((i) => {
          const e = embed('green', 'timer.png').setTitle(`Autocmds - [ ${i.time} ]`)
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
        let index = autocmd.findIndex((i) => i.time === taskTime)

        args.splice(0, 2)
        const command = args.join(' ')

        // create Autocmd if doesnt exist
        if (index === -1) {
          autocmd.push({ time: taskTime, commands: [] })
          index = autocmd.findIndex((i) => i.time === taskTime)
        }

        if (!command) {
          if (api) return `Please specify the command to add to the Autocmd`
          return warningMessage(msg, `Please specify the command to add to the Autocmd`)
        }

        // check if command is already part of Autocmd
        if (autocmd[index].commands.includes(command)) {
          if (api) return `Autocmd at [ ${taskTime} ] already has command [ ${command} ]`
          return warningMessage(
            msg,
            `Autocmd at [ ${taskTime} ] already has command [ ${command} ]`
          )
        }

        // save changes
        autocmd[index].commands.push([true, command])
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Added command [ ${command} ] to Autocmd at [ ${taskTime} ]`
        await standardMessage(msg, `Added command [ ${command} ] to Autocmd at [ ${taskTime} ]`)
        return process.exit()
      }

      case 'remove': {
        const taskTime = args[1]
        const timeIndex = autocmd.findIndex((i) => i.time === taskTime)

        // create Autocmd if doesnt exist
        if (timeIndex === -1) {
          if (api) return `Autocmd at [ ${taskTime} ] does not exist`
          return warningMessage(msg, `Autocmd at [ ${taskTime} ] does not exist`)
        }

        if (args[2]) {
          args.splice(0, 2)
          const command = args.join(' ')

          // get index of individual command list
          const commandListIndex = autocmd[timeIndex].commands.findIndex((i) => i[1] === command)
          // check if command exists
          if (!autocmd[timeIndex].commands[commandListIndex].includes(command)) {
            if (api) {
              return `Autocmd at [ ${taskTime} ] doesnt contain command [ ${command} ]`
            }
            return warningMessage(
              msg,
              `Autocmd at [ ${taskTime} ] doesnt contain command [ ${command} ]`
            )
          }
          // remove command from Autocmd
          const commandIndex = autocmd[timeIndex].commands.findIndex((i) => i === command)
          // save changes
          autocmd[timeIndex].commands.splice(commandIndex, 1)
          await db.update({ config: JSON.stringify(config) })
          if (api) return `Removed command [ ${command} ] from Autocmd at [ ${taskTime} ]`
          await standardMessage(
            msg,
            `Removed command [ ${command} ] from Autocmd at [ ${taskTime} ]`
          )
          return process.exit()
        }

        // save changes
        autocmd.splice(timeIndex, 1)
        await db.update({ config: JSON.stringify(config) })
        if (api) return `Removed Autocmd at [ ${taskTime} ]`
        await standardMessage(msg, `Removed Autocmd at [ ${taskTime} ]`)
        return process.exit()
      }

      default:
        return validOptions(msg, ['list', 'add', 'remove', 'changetime', 'disable', 'enable'])
    }
  }
}
