const Command = require('../../core/Command')

class Ping extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      category: 'Networking Tools',
      description: 'Check Bot Latency',
      usage: `ping`,
      webUI: true,
      ownerOnly: true
    })
  }

  async run(client, msg, args, api) {
    const { Utils } = client
    const { author, channel } = msg

    const embed = Utils.embed(msg)

    if (!api) {
      embed.setFooter(`Requested by: ${author.username}`, author.avatarURL)
      embed.setTitle(`Pong! Your ping is ${Date.now() - msg.createdTimestamp} ms`)
      return channel.send({ embed })
    }
    return `Pong! Your ping is ${Date.now() - msg.createdTimestamp} ms`
  }
}
module.exports = Ping
