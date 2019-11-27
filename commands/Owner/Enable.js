const Command = require('../../core/Command')

module.exports = class Enable extends Command {
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

    const db = await generalConfig.findOne({ where: { id: client.config.ownerID } })
    const { config } = client.db
    const { disabledCommands } = config

    // * ------------------ Logic --------------------

    const checkIfDisabled = async (command) => {
      let isDisabled = false
      disabledCommands.forEach((i) => {
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
          await disabledCommands.forEach(async (c, index) => {
            const { aliases, command } = c

            if (aliases.includes(i) || command === i) disabledCommands.splice(index, 1)

            await db.update({ config: JSON.stringify(config) })
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
