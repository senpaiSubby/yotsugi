/* eslint-disable class-methods-use-this */
const Discord = require('discord.js')
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
    const embed = new Discord.RichEmbed()

    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
      embed.setTitle(`Pong! Your ping is ${Date.now() - msg.createdTimestamp} ms`)
      return msg.channel.send({ embed })
    }
    return `Pong! Your ping is ${Date.now() - msg.createdTimestamp} ms`
  }
}
module.exports = Ping
