const Command = require('../../core/Command')

module.exports = class Error extends Command {
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
    // * ------------------ Setup --------------------

    const { error } = client.Utils
    const { channel } = msg

    // * ------------------ Logic --------------------

    return error('Test Error', 'Error Triggered by Admin', channel)
  }
}
