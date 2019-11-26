// todo change to list external and internal ip's
const fetch = require('node-fetch')
const Command = require('../../core/Command')

class SystemIP extends Command {
  constructor(client) {
    super(client, {
      name: 'ip',
      category: 'Networking',
      description: 'Show Server IP',
      usage: [`ip <external/local>`],
      ownerOnly: true,
      args: false
    })
  }

  async run(client, msg, api) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { warningMessage } = Utils

    // * ------------------ Logic --------------------

    const response = await fetch('https://ifconfig.co/json')

    const data = await response.json()
    if (api) return data
    return warningMessage(msg, `${data.ip}`)
  }
}
module.exports = SystemIP
