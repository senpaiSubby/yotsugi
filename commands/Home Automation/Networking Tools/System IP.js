/* eslint-disable class-methods-use-this */
// todo change to list external and internal ip's
const fetch = require('node-fetch')
const Discord = require('discord.js')
const Command = require('../../../core/Command')

class SystemIP extends Command {
  constructor(client) {
    super(client, {
      name: 'ip',
      category: 'Networking Tools',
      description: 'Show Server IP',
      usage: `ip <external/local>`,
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    const embed = new Discord.RichEmbed()
    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }

    const response = await fetch('https://ifconfig.co/json')
    const data = await response.json()
    embed.setTitle(`${data.ip}`)
    return msg.channel.send({ embed }).then((m) => m.delete(10000))
  }
}
module.exports = SystemIP
