require('moment-duration-format')
const Command = require('../../../core/Command')

class Ping extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      category: 'Bot Utils',
      description: 'Check discord latency.',
      ownerOnly: true
    })
  }

  async run(client, msg) {
    const { Utils } = client
    const { channel, author } = msg

    return channel.send(
      Utils.embed(msg, 'green')
        .setFooter(`Requested by: ${author.username}`, author.avatarURL)
        .setTitle(`Pong! Your ping is ${Date.now() - msg.createdTimestamp} ms`)
    )
  }
}
module.exports = Ping
