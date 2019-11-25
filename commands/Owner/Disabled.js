const Command = require('../../core/Command')
const Database = require('../../core/Database')

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

    const { Utils } = client
    const { standardMessage } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const generalConfig = await Database.Models.generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const values = JSON.parse(generalConfig.dataValues.disabledCommands)

    // * ------------------ Usage Logic --------------------

    const disabledCommands = []
    values.forEach((i) => {
      disabledCommands.push(i.command)
    })
    if (disabledCommands.length)
      return channel.send(
        Utils.embed(msg)
          .setTitle('Disabled Commands')
          .setDescription(`**- ${disabledCommands.join('\n- ')}**`)
      )

    return standardMessage(msg, `No commands are disabled`)
  }
}
module.exports = Disabled
