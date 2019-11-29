// todo change to list external and internal ip's
const fetch = require('node-fetch')
const Command = require('../../core/Command')

module.exports = class SystemIP extends Command {
  constructor(client) {
    super(client, {
      name: 'ip',
      category: 'Networking',
      description: 'Show Server IP',
      usage: [`ip <external/local>`],
      ownerOnly: true,
      args: false,
      webUI: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { warningMessage } = client.Utils

    // * ------------------ Logic --------------------

    const response = await fetch('https://ifconfig.co/json')

    const data = await response.json()
    if (api) return data.ip
    return warningMessage(msg, `[ ${data.ip} ]`)
  }
}
