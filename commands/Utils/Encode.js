const Command = require('../../core/Command')

module.exports = class Encode extends Command {
  constructor(client) {
    super(client, {
      name: 'encode',
      category: 'Utils',
      description: 'Encodes a message to binary',
      usage: ['encode <text>'],
      args: true
    })
  }

  async run(client, msg, args) {
    const { standardMessage } = client.Utils

    const Encodemsg = args.slice(0).join(' ')

    let encoded = ''
    for (let i = 0; i < Encodemsg.length; i++) {
      const bin = Encodemsg[i].charCodeAt().toString(2)
      encoded += Array(8 - bin.length + 1).join('0') + bin
    }

    await msg.delete()
    return standardMessage(msg, encoded)
  }
}
