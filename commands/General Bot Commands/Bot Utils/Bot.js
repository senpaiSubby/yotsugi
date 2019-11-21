const Command = require('../../../core/Command')

class restart extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      category: 'Bot Utils',
      description: 'Restarts the bot.',
      ownerOnly: true
    })
  }

  async run(client, msg) {
    const { Utils } = client
    const { channel } = msg

    const m = await channel.send(Utils.embed(msg, 'green').setTitle('Restarting in 10 seconds..'))
    await m.delete(10000)
    await channel.send(Utils.embed(msg, 'yellow').setTitle('Restarting..'))
    return process.exit()
  }
}
module.exports = restart
