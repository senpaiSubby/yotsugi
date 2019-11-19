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
      return channel
        .send(Utils.embed(msg).setDescription(`Reloaded **${module}**`))
        .then((m) => m.delete(10000))
    }

    return channel
      .send(Utils.embed(msg).setDescription(`Module **${module}** doesn't exist!`))
      .then((m) => m.delete(10000))
  }
}

module.exports = Reload
