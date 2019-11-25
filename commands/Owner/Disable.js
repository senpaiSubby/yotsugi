const Command = require('../../core/Command')
const Database = require('../../core/Database')

class Disable extends Command {
  constructor(client) {
    super(client, {
      name: 'disable',
      category: 'Owner',
      description: 'Disable commands you dont want to use',
      usage: 'disable <command name> | disable all',
      args: true,
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { warningMessage } = Utils
    const { channel } = msg

    const nonDisableable = ['disable', 'disabled', 'enable', 'help']

    // * ------------------ Config --------------------

    const generalConfig = await Database.Models.generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const values = JSON.parse(generalConfig.dataValues.disabledCommands)

    // * ------------------ Logic --------------------

    const checkIfDisabled = async (command) => {
      let isDisabled = false
      values.forEach((i) => {
        if (command === i.command || i.aliases.includes(command)) isDisabled = true
      })
      if (isDisabled) return true
      return false
    }

    const disableCommands = async (commands) => {
      const alreadyDisabled = []
      const willDisable = []
      const cannotDisable = []

      await commands.forEach(async (i) => {
        const cmd = msg.context.findCommand(i)
        if (!cmd) return warningMessage(msg, `No command named [ ${i} ]`)
        if (!nonDisableable.includes(i)) {
          const isDisabled = await checkIfDisabled(i)

          if (isDisabled) alreadyDisabled.push(i)

          if (!isDisabled) {
            willDisable.push(i)
            values.push({ command: cmd.name, aliases: cmd.aliases })
            await generalConfig.update({ disabledCommands: JSON.stringify(values) })
          }
        }
        if (nonDisableable.includes(i)) cannotDisable.push(i)
      })

      if (cannotDisable.length) {
        const m = await channel.send(
          Utils.embed(msg, 'red')
            .setTitle('The following commands CANNOT be disabled since they are required!')
            .setDescription(`**- ${cannotDisable.join('\n- ')}**`)
        )
        m.delete(20000)
      }

      if (alreadyDisabled.length) {
        const m = await channel.send(
          Utils.embed(msg, 'yellow')
            .setTitle('The following commands are already disabled')
            .setDescription(`**- ${alreadyDisabled.join('\n- ')}**`)
        )
        m.delete(20000)
      }

      if (willDisable.length)
        await channel.send(
          Utils.embed(msg)
            .setTitle('Disabled the Commands')
            .setDescription(`**- ${willDisable.join('\n- ')}**`)
        )
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'all': {
        const commandList = msg.context.commands.map((i) => i.name)
        return disableCommands(commandList)
      }
      default:
        return disableCommands(args)
    }
  }
}

module.exports = Disable
