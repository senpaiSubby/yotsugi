const Command = require('../../core/Command')

class Decode extends Command {
  constructor(client) {
    super(client, {
      name: 'decode',
      category: 'Utils',
      description: 'Decode a message from binary',
      usage: 'decode 0110011001110101011000110110101100100000011110010110111101110101',
      args: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { standardMessage } = Utils

    const Decodemsg = args.slice(0).join(' ')

    let decoded = ''
    const arr = Decodemsg.match(/.{1,8}/g)
    for (let i = 0; i < arr.length; i++)
      decoded += String.fromCharCode(parseInt(arr[i], 2).toString(10))

    return standardMessage(msg, decoded)
  }
}
module.exports = Decode
