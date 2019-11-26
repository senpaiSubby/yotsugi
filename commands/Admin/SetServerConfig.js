const Command = require('../../core/Command')

class Get extends Command {
  constructor(client) {
    super(client, {
      name: 'server',
      category: 'Admin',
      description: 'Set/Get server config for bot',
      usage: ['server get', 'server set <key> <value'],
      args: true,
      permsNeeded: ['MANAGE_GUILD']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, serverConfig } = client
    const { warningMessage, validOptions, standardMessage } = Utils
    const { author } = msg
    const option = args[0]
    const key = args[1]
    const value = args[2]

    // * ------------------ Logic --------------------

    switch (option) {
      case 'get':
        {
          const config = await serverConfig.findOne({
            where: { id: msg.guild.id }
          })
          const values = config.dataValues
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
        const config = await serverConfig.findOne({
          where: { id: msg.guild.id }
        })
        const values = config.dataValues
        if (
          ['serverName', 'id', 'ownerID', 'createdAt', 'updatedAt'].includes(key) &&
          author.id !== client.config.ownerID
        ) {
          return warningMessage(msg, `DB value [${key}] cannot be edited`)
        }

        if (key in values) {
          await config.update({ [key]: value })
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
