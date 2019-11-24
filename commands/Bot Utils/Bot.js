const Command = require('../../core/Command')

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
    const { warningMessage } = Utils

    await warningMessage(msg, `Restarting in 10 seconds..`)
    await warningMessage(msg, `Restarting..`)
    return process.exit()
  }
}
module.exports = restart
