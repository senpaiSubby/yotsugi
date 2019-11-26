const Command = require('../../core/Command')

class Disabled extends Command {
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

    const { Utils, generalConfig } = client
    const { standardMessage, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const config = await generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const values = JSON.parse(config.dataValues.disabledCommands)

    // * ------------------ Usage Logic --------------------

    const disabledCommands = []
    values.forEach((i) => {
      disabledCommands.push(i.command)
    })
    if (disabledCommands.length) {
      return channel.send(
        embed(msg)
          .setTitle('Disabled Commands')
          .setDescription(`**- ${disabledCommands.join('\n- ')}**`)
      )
    }

    return standardMessage(msg, `No commands are disabled`)
  }
}
module.exports = Disabled
