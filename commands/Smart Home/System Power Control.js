const fetch = require('node-fetch')
const wol = require('wol')
const Command = require('../../core/Command')

module.exports = class SystemPowerController extends Command {
  constructor(client) {
    super(client, {
      name: 'pc',
      category: 'Smart Home',
      description: 'Power linux systems on/off',
      usage: [`system gaara off`, `pc thinkboi reboot`],
      aliases: ['system'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { Utils, Log } = client
    const { errorMessage, validOptions, standardMessage, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const devices = client.db.config.systemPowerControl

    // * ------------------ Logic --------------------

    const sendCommand = async (device, command) => {
      const { host, mac, name } = device

      const options = ['reboot', 'off', 'on']
      if (!options.includes(command)) {
        await validOptions(msg, options)
        return
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
            if (api) return `Told ${name} to ${text}`
            return standardMessage(msg, `:desktop: Told ${name} to ${text}`)
          }
        } catch (e) {
          if (api) return `Failed to connect to ${name}`
          Log.error('System Power Control', `Failed to connect to ${name}`, e)
          await errorMessage(msg, `Failed to connect to ${name}`)
        }
      } else if (command === 'on') {
        await wol.wake(mac)
        if (api) return `Sent  WOL to ${name}`
        return standardMessage(msg, `:desktop: Sent  WOL to ${name}`)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        // todo add listing functionality
        return channel.send(embed(msg))
      }

      default: {
        const system = args[0]
        const command = args[1]
        const index = devices.findIndex((d) => d.name === system)
        const host = devices[index]
        return sendCommand(host, command)
      }
    }
  }
}
