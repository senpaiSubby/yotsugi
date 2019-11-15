const Command = require('../core/Command')

class Ping extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      description: 'pong',
      aliases: [],
      admin: false
    })
  }

  async run(client, msg, args, api) {
    console.log('pong')
  }
}

module.exports = Ping
