const Discord = require('discord.js')
const urljoin = require('url-join')
const config = require('../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: '',
    category: '',
    description: '',
    usage: `${prefix}`,
    aliases: ['']
  },
  options: {
    enabled: false,
    apiEnabled: false,
    showInHelp: false,
    ownerOnly: true,
    guildOnly: true,
    args: false,
    cooldown: 5
  },
  async execute(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const logger = client.logger

    if (!api) msg.delete()

    // ------------------------- Config --------------------------
    // ----------------------- Main Logic ------------------------
    // ---------------------- Usage Logic ------------------------
    if (!api) {
      const embed = new Discord.RichEmbed().setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }
  }
}
