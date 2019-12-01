const Command = require('../../core/Command')

module.exports = class Disabled extends Command {
  constructor(client) {
    super(client, {
      name: 'disabled',
      category: 'Owner',
      description: 'List disabled commands',
      ownerOnly: true
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { standardMessage, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { disabledCommands } = client.db.config

    // * ------------------ Usage Logic --------------------

    const commandList = []
    disabledCommands.forEach((i) => commandList.push(i.command))
    if (commandList.length) {
      return channel.send(
        embed('green')
          .setTitle('Disabled Commands')
          .setDescription(`**- ${commandList.join('\n- ')}**`)
      )
    }

    return standardMessage(msg, `No commands are disabled`)
  }
}
