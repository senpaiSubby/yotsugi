const Command = require('../../core/Command')
const Database = require('../../core/Database')

class Set extends Command {
  constructor(client) {
    super(client, {
      name: 'set',
      category: 'Database',
      description: 'Sets data in the DB',
      usage: 'set <general/server> <key> <key> <value>',
      args: true,
      ownerOnly: true
    })
  }

  async run(client, msg, args, api) {
    const { Utils } = client
    const { author, channel } = msg

    switch (args[0]) {
      case 'server':
        {
          const serverConfig = await Database.Models.serverConfig.findOne({
            where: { id: msg.guild.id }
          })
          const values = serverConfig.dataValues
          const keyToChange = args[1]
          const val1 = args[2]
          if (keyToChange in values) {
            await serverConfig.update({ [keyToChange]: val1 })
            return msg.channel.send(
              Utils.embed(msg, 'green').setDescription(`Server **${keyToChange}** changed to **${val1}**`)
            )
          }
        }
        break
      case 'general':
        {
          const generalConfig = await Database.Models.generalConfig.findOne({
            where: { id: client.config.ownerID }
          })
          const values = generalConfig.dataValues
          const keyToChange = args[1]
          const key1 = args[2]
          const val1 = args[3]
          if (keyToChange in values) {
            const tempObject = JSON.parse(values[args[1]])
            tempObject[key1] = val1
            await generalConfig.update({ [keyToChange]: JSON.stringify(tempObject) })
            return msg.channel.send(
              Utils.embed(msg, 'green').setDescription(
                `Key **${keyToChange}.${key1}** changed to **${val1}**`
              )
            )
          }

          // msg.reply(JSON.stringify(args[1] ? [args[1]] : values, null, 2), { code: 'json' })
        }
        break
      default:
        break
    }
  }
}
module.exports = Set
