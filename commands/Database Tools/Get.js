const Command = require('../../core/Command')
const Database = require('../../core/Database')

class Get extends Command {
  constructor(client) {
    super(client, {
      name: 'get',
      category: 'Database',
      description: 'Gets data from the DB',
      usage: 'get <general/server> | get <general/server> <key>',
      args: true,
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    console.log(args)
    console.log(msg.flags)
    const { Utils } = client

    switch (args[0]) {
      case 'server':
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
      case 'general': {
        const generalConfig = await Database.Models.generalConfig.findOne({
          where: { id: msg.author.id }
        })

        if (generalConfig) {
          const values = generalConfig.dataValues
          const key1 = args[1]
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
        break
      }
      default:
        break
    }
  }
}
module.exports = Get
