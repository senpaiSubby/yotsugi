const Discord = require('discord.js')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'ping',
    category: 'Networking Tools',
    description: 'Check Bot Latency',
    usage: `${prefix}ping`,
    aliases: ['']
  },
  options: {
    enabled: true,
    apiEnabled: true,
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
      embed.setTitle('Pong! Your ping is `' + `${Date.now() - msg.createdTimestamp}` + ' ms`')
      return msg.channel.send({ embed })
    } else {
      return 'Pong! Your ping is `' + `${Date.now() - msg.createdTimestamp}` + ' ms`'
    }
  }
}
