const Command = require('../../../core/Command')

class Error extends Command {
  constructor(client) {
    super(client, {
      name: 'error',
      category: 'Owner',
      description: 'Triggers an Error',
      aliases: ['err'],
      ownerOnly: true
    })
  }

  async run(client, msg) {
    const { Utils } = client
    const { channel } = msg

    return Utils.error('Test Error', 'Error Triggered by Admin', channel)
  }
}

module.exports = Error
