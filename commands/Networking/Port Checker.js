const { findAPortNotInUse, checkPortStatus } = require('portscanner')
const Command = require('../../core/Command')

/**
 * ! logic doesnt work fix callbacks
 */

class PortChecker extends Command {
  constructor(client) {
    super(client, {
      name: 'port',
      category: 'Networking',
      description: 'Check open/closed and available ports',
      usage: `port <80> | port find`,
      aliases: ['ports'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, colors } = client
    const { channel } = msg

    // * ------------------ Config --------------------

    const targetIP = '10.0.0.5'
    const command = args[0]

    // * ------------------ Usage Logic --------------------

    const embed = Utils.embed(msg, 'green')

    switch (command) {
      case 'find': {
        // if command is "find" then we'll find us a random open port
        const port = await findAPortNotInUse(3000, 4000)
        embed.setDescription(`**Port ${port} is available for use.**`)
        return channel.send({ embed })
      }
      default: {
        if (isNaN(command)) {
          // check if port is a number
          embed.setDescription('**Port should be a number.**')
          embed.setColor(colors.yellow)
        }

        // Checks the status of a single port
        checkPortStatus(args[0], targetIP, async (error, status) => {
          if (error) {
            embed.setDescription('**No connection to host**')
            embed.setColor(colors.red)
            return channel.send({ embed })
          }
          // Status is 'open' if currently in use or 'closed' if available
          if (status === 'open') {
            embed.setDescription(`**Port ${args[0]} is open and in use.**`)
            return channel.send({ embed })
          }
          if (status === 'closed') {
            embed.setDescription(`**Port ${args[0]} is closed and available.**`)
            embed.setColor(colors.yellow)
            return channel.send({ embed })
          }
        })
        break
      }
    }
  }
}
module.exports = PortChecker
