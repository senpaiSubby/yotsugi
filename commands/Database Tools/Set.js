const Command = require('../../core/Command')
const Database = require('../../core/Database')

class Set extends Command {
  constructor(client) {
    super(client, {
      name: 'set',
      category: 'Database',
      description: 'Sets data in the DB',
      usage: 'set <key1> <key2> <value>',
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client

    const generalConfig = await Database.Models.generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const values = generalConfig.dataValues
    const keyToChange = args[0]
    const key1 = args[1]
    const val1 = args[2]
    if (keyToChange in values) {
      const tempObject = JSON.parse(values[args[0]])
      tempObject[key1] = val1
      await generalConfig.update({ [keyToChange]: JSON.stringify(tempObject) })
      return msg.channel.send(
        Utils.embed(msg, 'green').setDescription(
          `Key **${keyToChange}.${key1}** changed to **${val1}**`
        )
      )
    }
  }
}
module.exports = Set
