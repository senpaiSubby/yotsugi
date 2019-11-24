const Command = require('../../core/Command')
const Database = require('../../core/Database')

class Disable extends Command {
  constructor(client) {
    super(client, {
      name: 'disable',
      category: 'Owner',
      description: 'Disable commands you dont want to use',
      usage: 'disable emby',
      args: true,
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { warningMessage } = Utils
    const { channel } = msg

    const generalConfig = await Database.Models.generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const values = JSON.parse(generalConfig.dataValues.disabledCommands)

    const checkIfDisabled = async (command) => {
      let isDisabled = false
      values.forEach((i) => {
        if (command === i.command || i.aliases.includes(command)) {
          isDisabled = true
        }
      })
      if (isDisabled) return true
      return false
    }

    const disableCommands = async (commands) => {
      const alreadyDisabled = []
      const willDisable = []

      await commands.forEach(async (i) => {
        const cmd = msg.context.findCommand(i)
        if (!cmd) return warningMessage(msg, `No command named [ ${i} ]`)

        const isDisabled = await checkIfDisabled(i)

        if (isDisabled) alreadyDisabled.push(i)

        if (!isDisabled) {
          willDisable.push(i)
          values.push({ command: cmd.name, aliases: cmd.aliases })
          await generalConfig.update({ disabledCommands: JSON.stringify(values) })
        }
      })

      if (alreadyDisabled.length) {
        const m = await channel.send(
          Utils.embed(msg, 'yellow')
            .setTitle('The following commands are already disabled')
            .setDescription(`**- ${alreadyDisabled.join('\n- ')}**`)
        )
        m.delete(20000)
      }

      if (willDisable.length) {
        await channel.send(
          Utils.embed(msg)
            .setTitle('Disabled the Commands')
            .setDescription(`**- ${willDisable.join('\n- ')}**`)
        )
      }
    }
    return disableCommands(args)
  }
}

module.exports = Disable
