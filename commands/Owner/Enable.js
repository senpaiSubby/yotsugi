const Command = require('../../core/Command')

class Enable extends Command {
  constructor(client) {
    super(client, {
      name: 'enable',
      category: 'Owner',
      description: 'Enable commands you have disabled',
      usage: ['enable <command name>', 'enable all'],
      args: true,
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, generalConfig } = client
    const { warningMessage, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const config = await generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const values = JSON.parse(config.dataValues.disabledCommands)

    // * ------------------ Logic --------------------

    const checkIfDisabled = async (command) => {
      let isDisabled = false
      values.forEach((i) => {
        if (command === i.command || i.aliases.includes(command)) isDisabled = true
      })
      if (isDisabled) return true
      return false
    }

    const enableCommands = async (commands) => {
      const alreadyEnabled = []
      const willEnable = []

      await commands.forEach(async (i) => {
        const cmd = msg.context.findCommand(i)
        if (!cmd) return warningMessage(msg, `No command named [ ${i} ]`)

        const isDisabled = await checkIfDisabled(i)

        if (!isDisabled) alreadyEnabled.push(i)

        if (isDisabled) {
          willEnable.push(i)
          await values.forEach(async (c, index) => {
            const { aliases, command } = c

            if (aliases.includes(i) || command === i) values.splice(index, 1)

            await config.update({ disabledCommands: JSON.stringify(values) })
          })
        }
      })

      if (alreadyEnabled.length) {
        const m = await channel.send(
          embed(msg, 'yellow')
            .setTitle('The following commands are already enabled')
            .setDescription(`**- ${alreadyEnabled.join('\n- ')}**`)
        )
        m.delete(20000)
      }

      if (willEnable.length) {
        await channel.send(
          embed(msg)
            .setTitle('Enabled the Commands')
            .setDescription(`**- ${willEnable.join('\n- ')}**`)
        )
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'all': {
        const commandList = msg.context.commands.map((i) => i.name)
        return enableCommands(commandList)
      }
      default:
        return enableCommands(args)
    }
  }
}
module.exports = Enable
