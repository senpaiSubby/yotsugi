// todo change to list external and internal ip's

const fetch = require('node-fetch')
const Discord = require('discord.js')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'ip',
    category: 'Networking Tools',
    description: 'Show Server IP',
    usage: `${prefix}ip <external/local>`,
    aliases: ['']
  },
  options: {
    enabled: true,
    apiEnabled: false,
    showInHelp: true,
    ownerOnly: true,
    guildOnly: true,
    args: false,
    cooldown: 5
  },
  async execute (client, msg, args, api) {
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
