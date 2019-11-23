const fetch = require('node-fetch')
const wol = require('wol')
const Command = require('../../../core/Command')

class SystemPowerController extends Command {
  constructor(client) {
    super(client, {
      name: 'pc',
      category: 'Smart Home',
      description: 'Power linux systems on/off',
      usage: `system gaara off | pc thinkboi reboot`,
      aliases: ['system'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { Log, Utils } = client
    const { errorMessage, validOptions, standardMessage } = Utils
    const { channel } = msg
    // ------------------------- Config --------------------------

    const devices = JSON.parse(client.settings.systemPowerControl)

    // ----------------------- Main Logic ------------------------

    const sendCommand = async (host, mac, command) => {
      const options = ['reboot', 'off', 'on']
      if (!options.includes(command)) {
        return 'bad params'
      }
      if (command === 'reboot' || command === 'off') {
        try {
          const response = await fetch(`${host}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
          })
          const statusCode = response.status
          if (statusCode === 200) {
            const text = command === 'reboot' ? 'reboot' : 'power off'
            return `${text}`
          }
        } catch (error) {
          Log.warn(error)
          return 'error'
        }
      } else if (command === 'on') {
        await wol.wake(mac)
        return 'on'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg, 'green')

    switch (args[0]) {
      case 'list': {
        // todo add listing functionality
        return channel.send({ embed })
      }

      default: {
        const system = args[0]
        const command = args[1]
        const index = devices.findIndex((d) => d.name === system)
        const host = devices[index]
        const status = await sendCommand(host.host, host.mac, command)

        switch (status) {
          case 'reboot':
          case 'power off':
            if (api) return `Told ${system} to ${status}`

            return standardMessage(msg, `:desktop: Told ${system} to ${status}`)

          case 'on':
            if (api) return `Sent  WOL to ${system}`

            return standardMessage(msg, `:desktop: Sent  WOL to ${system}`)

          case 'bad params':
            return validOptions(msg, ['on', 'off', 'reboot'])

          default:
            if (api) return `Failed to connect to ${system}`
            return errorMessage(msg, `Failed to connect to ${system}`)
        }
      }
    }
  }
}
module.exports = SystemPowerController
