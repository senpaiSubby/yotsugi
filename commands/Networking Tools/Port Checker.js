const Command = require('../../core/Command')
const Discord = require('discord.js')
const portscanner = require('portscanner')
const config = require('../../data/config')
const { prefix } = config.general

/**
 * ! logic doesnt work fix callbacks
 */

class PortChecker extends Command {
  constructor(client) {
    super(client, {
      name: 'port',
      category: 'Networking Tools',
      description: 'Check open/closed and available ports',
      usage: `${prefix}port <80> | ${prefix}port find`,
      aliases: ['ports'],
      args: false,
      disabled: false,
      ownerOnly: true,
      guildOnly: true,
      webUI: false
    })
  }

  async run(msg, args, api) {
    // -------------------------- Setup --------------------------

    // ------------------------- Config --------------------------

    const targetIP = '10.0.0.5'
    const command = args[0]

    // ----------------------- Main Logic ------------------------

    // ---------------------- Usage Logic ------------------------

    const embed = new Discord.RichEmbed()
    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }

    switch (command) {
      case 'find': // if command is "find" then we'll find us a random open port
        portscanner.findAPortNotInUse(3000, 4000).then(async (port) => {
          embed.setTitle(`Port ${port} is available for use.`)
          return msg.channel.send({ embed })
        })
        break

      default: {
        if (isNaN(command)) {
          // check if port is a number
          embed.setTitle('Port should be a number.')
        }

        // Checks the status of a single port
        portscanner.checkPortStatus(args[0], targetIP, async (error, status) => {
          if (error) {
            embed.setTitle('No connection to host')
            return msg.channel.send({ embed })
          }
          // Status is 'open' if currently in use or 'closed' if available
          if (status === 'open') {
            embed.setTitle(`Port ${args[0]} is open and in use.`)
            return msg.channel.send({ embed })
          } else if (status === 'closed') {
            embed.setTitle(`Port ${args[0]} is closed and available.`)
            return msg.channel.send({ embed })
          }
        })
        break
      }
    }
  }
}
module.exports = PortChecker
