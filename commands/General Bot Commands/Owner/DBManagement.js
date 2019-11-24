const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class DBManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'db',
      category: 'Owner',
      description: 'Get/Set data in the DB',
      usage: 'db get | db get emby | db set emby host https://emby.url',
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { warningMessage, validOptions, standardMessage } = Utils
    const { channel } = msg

    msg.delete(10000)

    const generalConfig = await Database.Models.generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const values = generalConfig.dataValues

    switch (args[0]) {
      case 'get': {
        const key1 = args[1]
        let x = ''
        if (!key1) {
          Object.keys(values).forEach((key) => {
            x += `${key}\n${values[key]}\n`
          })
          const m = await channel.send(x, { code: 'json' })
          return m.delete(30000)
        }
        if (key1 in values) {
          x = `${values[key1]}`
          const m = await msg.reply(
            x
              .replace(/,/g, ',\n')
              .replace(/\{/g, '{\n')
              .replace(/\}/g, '\n}'),
            { code: 'json' }
          )
          return m.delete(20000)
        }
        return warningMessage(msg, `Key [${key1}] doesnt exist`)
      }
      case 'set': {
        const keyToChange = args[1]
        const key1 = args[2]
        const val1 = args[3]
        if (keyToChange in values && key1 in JSON.parse(values[keyToChange])) {
          const tempObject = JSON.parse(values[args[1]])
          tempObject[key1] = val1
          await generalConfig.update({ [keyToChange]: JSON.stringify(tempObject) })
          const m = await standardMessage(msg, `Key [${keyToChange}.${key1}] changed to [${val1}]`)
          return m.delete(10000)
        }
        return warningMessage(msg, `Key [${key1}] doesnt exist`)
      }
      default: {
        return validOptions(msg, ['get', 'set'])
      }
    }
  }
}
module.exports = DBManagement
