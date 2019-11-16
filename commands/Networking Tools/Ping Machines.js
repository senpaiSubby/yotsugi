const Command = require('../../core/Command')
const Discord = require('discord.js')
const config = require('../../data/config')
const { prefix } = config.general

class PingMachines extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      category: 'Networking Tools',
      description: 'Check Bot Latency',
      usage: `${prefix}ping`,
      aliases: [],
      webUI: true
    })
  }

  async run(msg, args, api) {
    const embed = new Discord.RichEmbed()

    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
      embed.setTitle('Pong! Your ping is `' + `${Date.now() - msg.createdTimestamp}` + ' ms`')
      return msg.channel.send({ embed })
    } else {
      return 'Pong! Your ping is `' + `${Date.now() - msg.createdTimestamp}` + ' ms`'
    }
  }
}
module.exports = PingMachines
