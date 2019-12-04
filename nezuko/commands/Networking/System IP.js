const { get } = require('unirest')
const Command = require('../../core/Command')

module.exports = class SystemIP extends Command {
  constructor(client) {
    super(client, {
      name: 'ip',
      category: 'Networking',
      description: 'Get the server IP',
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

    const response = await get('https://ifconfig.co/json').headers({ accept: 'application/json' })

    const data = await response.body
    if (api) return data.ip
    return warningMessage(msg, `[ ${data.ip} ]`)
  }
}
