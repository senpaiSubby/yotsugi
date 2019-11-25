// todo change to list external and internal ip's
const fetch = require('node-fetch')
const Command = require('../../core/Command')

class SystemIP extends Command {
  constructor(client) {
    super(client, {
      name: 'ip',
      category: 'Networking',
      description: 'Show Server IP',
      usage: `ip <external/local>`,
      ownerOnly: true,
      args: false
    })
  }

  async run(client, msg, api) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { channel } = msg

    // * ------------------ Logic --------------------

    const response = await fetch('https://ifconfig.co/json')

    const data = await response.json()
    if (api) return data
    const embed = Utils.embed(msg).setTitle(`${data.ip}`)
    const m = await channel.send(embed)
    return m.delete(10000)
  }
}
module.exports = SystemIP
