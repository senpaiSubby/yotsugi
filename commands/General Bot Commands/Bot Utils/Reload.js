const Command = require('../../../core/Command')

class Reload extends Command {
  constructor(client) {
    super(client, {
      name: 'Reload',
      description: 'Reloads Commands',
      aliases: ['reset', 'flush'],
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { channel } = msg

    const module = args[0]

    if (!module) {
      const msg1 = await channel.send('Reloading all modules...')
      await msg.context.reloadCommands()
      await msg1.edit('Reloading all modules... done!')
      return false
    }

    const run = await msg.context.reloadCommand(module)

    if (run) {
      const m = await channel.send(Utils.embed(msg, 'green').setDescription(`Reloaded **${module}**`))
      return m.delete(10000)
    }

    const m = await channel.send(
      Utils.embed(msg, 'green').setDescription(`Module **${module}** doesn't exist!`)
    )
    return m.delete(10000)
  }
}

module.exports = Reload
