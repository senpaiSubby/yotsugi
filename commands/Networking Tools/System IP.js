// todo change to list external and internal ip's
const Command = require('../../core/Command')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const config = require('../../data/config')
const { prefix } = config.general

class SystemIP extends Command {
  constructor(client) {
    super(client, {
      name: 'ip',
      category: 'Networking Tools',
      description: 'Show Server IP',
      usage: `${prefix}ip <external/local>`,
      aliases: [],
      ownerOnly: true
    })
  }

  async run(msg, args, api) {
    const embed = new Discord.RichEmbed()
    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }

    const response = await fetch('https://ifconfig.co/json')
    const data = await response.json()
    embed.setTitle(`${data.ip}`)
    return msg.channel.send({ embed }).then((msg) => msg.delete(10000))
  }
}
module.exports = SystemIP
