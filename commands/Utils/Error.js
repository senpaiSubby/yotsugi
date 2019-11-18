const Command = require('../../core/Command')

class Error extends Command {
  constructor(client) {
    super(client, {
      name: 'Error',
      category: 'Utils',
      description: 'Triggers an Error',
      aliases: ['err'],
      ownerOnly: true
    })
  }

  async run(client, msg) {
    return client.Utils.error('Test Error', 'Error Triggered by Admin', msg.channel)
  }
}

module.exports = Error
