const Command = require('../../core/Command')

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
    const module = args[0]

    if (!module) {
      const msg1 = await msg.channel.send('Reloading all modules...')
      await msg.context.reloadCommands()
      await msg1.edit('Reloading all modules... done!')
      return false
    }

    const run = await msg.context.reloadCommand(module)

    if (run) {
      return msg.channel.send(`Reloaded **${module}**`).then((m) => m.delete(10000))
    }

    return msg.channel.send(`Module **${module}** doesn't exist!`).then((m) => m.delete(10000))
  }
}

module.exports = Reload
