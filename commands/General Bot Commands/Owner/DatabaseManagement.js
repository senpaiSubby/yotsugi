const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class DatabaseManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'db',
      category: 'Database',
      description: 'Get/Set data in the DB',
      usage: 'db get | db get emby | db set emby host https://emby.url',
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { channel } = msg

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
          return channel.send(x, { code: 'json' })
        }
        if (key1 in values) {
          x = `${values[key1]}`
          return msg.reply(
            x
              .replace(/,/g, ',\n')
              .replace(/\{/g, '{\n')
              .replace(/\}/g, '\n}'),
            { code: 'json' }
          )
        }
        return channel.send(Utils.embed(msg, 'red').setDescription(`Key **${key1}** doesnt exist.`))
      }
      case 'set': {
        const keyToChange = args[1]
        const key1 = args[2]
        const val1 = args[3]
        if (keyToChange in values && key1 in JSON.parse(values[keyToChange])) {
          const tempObject = JSON.parse(values[args[1]])
          tempObject[key1] = val1
          await generalConfig.update({ [keyToChange]: JSON.stringify(tempObject) })
          return channel.send(
            Utils.embed(msg, 'green').setDescription(
              `Key **${keyToChange}.${key1}** changed to **${val1}**`
            )
          )
        }
        return channel.send(Utils.embed(msg, 'red').setDescription(`Key **${key1}** doesnt exist.`))
      }
      default:
        return channel.send(
          Utils.embed(msg, 'green').setDescription(`Valid options are **[get/set]**`)
        )
    }
  }
}
module.exports = DatabaseManagement
