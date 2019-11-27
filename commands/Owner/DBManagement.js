const Command = require('../../core/Command')

module.exports = class DBManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'db',
      category: 'Owner',
      description: 'Get/Set data in the DB',
      usage: ['db get', 'db get emby', 'db set emby host https://emby.url'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, generalConfig, p } = client
    const { warningMessage, validOptions, standardMessage, chunkArray, embed } = Utils
    const { channel } = msg

    msg.delete(10000)

    // * ------------------ Config --------------------

    const db = await generalConfig.findOne({ where: { id: client.config.ownerID } })
    const { config } = client.db

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'get': {
        const key1 = args[1]
        if (!key1) {
          delete config.disabledCommands
          delete config.webUI
          delete config.routines
          delete config.shortcuts

          const e = embed(msg).setTitle('Database Keys').setDescription(`**[ ${p}db get <key> ]
            for more detailed info**`)

          const splitArray = chunkArray(Object.keys(config).sort(), 7)
          splitArray.forEach((item) => {
            let text = ''
            item.forEach((i) => (text += `**${i}**\n`))
            e.addField(`\u200b`, text, true)
          })
          return channel.send(e)
        }
        if (key1 in config) {
          const keys = Object.keys(config[key1])
          const e = embed(msg)
            .setTitle(`Database Keys [ ${key1} ]`)
            .setDescription(
              `**[ ${p}db set ${key1} <${keys.join(' | ')}> <new value> ] to change**`
            )

          keys.forEach((i) => {
            e.addField(`${i}`, `${config[key1][i]}`, true)
          })

          return channel.send(e)
        }
        return warningMessage(msg, `Key [${key1}] doesnt exist`)
      }
      case 'set': {
        const keyToChange = args[1]
        const key1 = args[2]
        const val1 = args[3]
        if (keyToChange in config && key1 in config[keyToChange]) {
          config[keyToChange][key1] = val1
          await db.update({ config: JSON.stringify(config) })
          const m = await standardMessage(msg, `[ ${keyToChange} ${key1} ] changed to [ ${val1} ]`)
          return m.delete(10000)
        }
        return warningMessage(msg, `Key [${key1}] doesnt exist`)
      }
      default:
        return validOptions(msg, ['get', 'set'])
    }
  }
}
