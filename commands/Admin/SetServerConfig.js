const Command = require('../../core/Command')

module.exports = class Get extends Command {
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

    const { Utils, serverConfig, p } = client
    const { warningMessage, validOptions, standardMessage, embed } = Utils
    const { channel, guild } = msg

    msg.delete(10000)

    // * ------------------ Config --------------------

    const db = await serverConfig.findOne({ where: { id: guild.id } })
    const { server } = client.db

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'get': {
        delete server.rules
        const keys = Object.keys(server).sort()

        const e = embed(msg)
          .setTitle('Server Database Keys')
          .setDescription(`**[ ${p}server set <key> <new value> ] to set new value**`)

        keys.forEach((i) => e.addField(`${i}`, `${server[i]}`, false))
        return channel.send(e)
      }

      case 'set': {
        const keyToChange = args[1]
        const newValue = args[2]
        if (keyToChange in server) {
          server[keyToChange] = newValue
          await db.update({ config: JSON.stringify(server) })
          const m = await standardMessage(msg, `Key [ ${keyToChange} ] changed to [ ${newValue} ]`)
          return m.delete(10000)
        }
        return warningMessage(msg, `Key [${keyToChange}] doesnt exist`)
      }
      default:
        return validOptions(msg, ['get', 'set'])
    }
  }
}
