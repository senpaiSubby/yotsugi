const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class Get extends Command {
  constructor(client) {
    super(client, {
      name: 'server',
      category: 'Admin',
      description: 'Set/Get server config for bot',
      usage: 'server get | server set <key> <value',
      args: true,
      permsNeeded: ['MANAGE_GUILD']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { warningMessage, validOptions, standardMessage } = Utils
    const { author } = msg
    const option = args[0]
    const key = args[1]
    const value = args[2]

    switch (option) {
      case 'get':
        {
          const serverConfig = await Database.Models.serverConfig.findOne({
            where: { id: msg.guild.id }
          })
          const values = serverConfig.dataValues
          // serverConfig.update({ [args[1]]: args[2] })
          msg.reply(
            JSON.stringify(args[1] ? values[args[1]] : values, null, 2)
              .replace(/"/g, '')
              .replace(/\\/g, '')
              .replace(/: /g, ':')
              .replace(/:/g, ': ')
              .replace(/,/g, ', '),
            {
              code: 'js'
            }
          )
        }
        break
      case 'set': {
        const serverConfig = await Database.Models.serverConfig.findOne({
          where: { id: msg.guild.id }
        })
        const values = serverConfig.dataValues
        if (
          ['serverName', 'id', 'ownerID', 'createdAt', 'updatedAt'].includes(key) &&
          author.id !== client.config.ownerID
        ) {
          return warningMessage(msg, `DB value [${key}] cannot be edited`)
        }
        if (key in values) {
          await serverConfig.update({ [key]: value })
          return standardMessage(msg, `Server [${key}] changed to [${value}]`)
        }
        return warningMessage(msg, `[${key}] does not exist`)
      }
      default:
        return validOptions(msg, ['get', 'set'])
    }
  }
}
module.exports = Get
