const { findAPortNotInUse, checkPortStatus } = require('portscanner')
const Command = require('../../core/Command')

/**
 * ! logic doesnt work fix callbacks
 */

module.exports = class PortChecker extends Command {
  constructor(client) {
    super(client, {
      name: 'port',
      category: 'Networking',
      description: 'Check open/closed and available ports',
      usage: [`port <80>`, `port find`],
      aliases: ['ports'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { warningMessage, standardMessage, errorMessage } = client.Utils

    // * ------------------ Config --------------------

    const targetIP = '10.0.0.5'
    const command = args[0]

    // * ------------------ Usage Logic --------------------

    switch (command) {
      case 'find': {
        // if command is "find" then we'll find us a random open port
        const port = await findAPortNotInUse(3000, 4000)
        return standardMessage(msg, `Port ${port} is available for use`)
      }
      default: {
        if (isNaN(command)) return warningMessage(msg, `Port should be a number`)

        // Checks the status of a single port
        checkPortStatus(args[0], targetIP, async (error, status) => {
          if (error) return errorMessage(msg, `No connection to host`)

          // Status is 'open' if currently in use or 'closed' if available
          if (status === 'open') {
            return standardMessage(msg, `Port ${args[0]} is open and in use`)
          }
          if (status === 'closed') {
            return standardMessage(msg, `Port ${args[0]} is closed and available`)
          }
        })
        break
      }
    }
  }
}
