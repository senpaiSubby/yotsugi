const Command = require('../../core/Command')
const Database = require('../../core/Database')

class Enable extends Command {
  constructor(client) {
    super(client, {
      name: 'enable',
      category: 'Owner',
      description: 'Enable commands you have disabled',
      usage: 'enable emby | enable plex',
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

            if (aliases.includes(i) || command === i) {
              values.splice(index, 1)
            }
            await generalConfig.update({ disabledCommands: JSON.stringify(values) })
          })
        }
      })

      if (alreadyEnabled.length) {
        const m = await channel.send(
          Utils.embed(msg, 'yellow')
            .setTitle('The following commands are already enabled')
            .setDescription(`**- ${alreadyEnabled.join('\n- ')}**`)
        )
        m.delete(20000)
      }

      if (willEnable.length) {
        await channel.send(
          Utils.embed(msg)
            .setTitle('Enabled the Commands')
            .setDescription(`**- ${willEnable.join('\n- ')}**`)
        )
      }
    }
    return enableCommands(args)
  }
}
module.exports = Enable
