const portscanner = require('portscanner')
const Command = require('../../../core/Command')

/**
 * ! logic doesnt work fix callbacks
 */

class PortChecker extends Command {
  constructor(client) {
    super(client, {
      name: 'port',
      category: 'Networking Tools',
      description: 'Check open/closed and available ports',
      usage: `port <80> | port find`,
      aliases: ['ports'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { Utils } = client
    const { author, channel } = msg
    // ------------------------- Config --------------------------

    const targetIP = '10.0.0.5'
    const command = args[0]

    // ----------------------- Main Logic ------------------------

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg)
    if (!api) {
      embed.setFooter(`Requested by: ${author.username}`, author.avatarURL)
    }

    switch (command) {
      case 'find': // if command is "find" then we'll find us a random open port
        portscanner.findAPortNotInUse(3000, 4000).then(async (port) => {
          embed.setTitle(`Port ${port} is available for use.`)
          return channel.send({ embed })
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
            return channel.send({ embed })
          }
          // Status is 'open' if currently in use or 'closed' if available
          if (status === 'open') {
            embed.setTitle(`Port ${args[0]} is open and in use.`)
            return channel.send({ embed })
          }
          if (status === 'closed') {
            embed.setTitle(`Port ${args[0]} is closed and available.`)
            return channel.send({ embed })
          }
        })
        break
      }
    }
  }
}
module.exports = PortChecker
