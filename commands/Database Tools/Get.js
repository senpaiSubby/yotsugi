const Command = require('../../core/Command')
const Database = require('../../core/Database')

class Get extends Command {
  constructor(client) {
    super(client, {
      name: 'get',
      category: 'Database',
      description: 'Gets data from the DB',
      usage: 'get | get <key>',
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client

    const generalConfig = await Database.Models.generalConfig.findOne({
      where: { id: msg.author.id }
    })

    if (generalConfig) {
      const values = generalConfig.dataValues
      const key1 = args[0]
      let x = ''
      if (!key1) {
        Object.keys(values).forEach((key) => {
          x += `${key}\n${values[key]}\n`
        })
        return msg.reply(x, { code: 'json' })
      }
      if (key1 in values) {
        x = `${values[key1]}`
        return msg.reply(x, { code: 'json' })
      }
      return msg.channel.send(
        Utils.embed(msg, 'red').setDescription(`Key **${key1}** doesnt exist.`)
      )
    }
  }
}
module.exports = Get
