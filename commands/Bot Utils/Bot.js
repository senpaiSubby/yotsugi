/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
const Discord = require('discord.js')
const Command = require('../../core/Command')

class BotManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'bot',
      category: 'Bot Utils',
      description: 'Performs bot related functions.',
      usage: `bot logout | bot restart | bot uptime`,
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // remove original msg
    if (!api) msg.delete()

    if (!api) {
      const embed = new Discord.RichEmbed().setFooter(`Requested by: ${msg.author.username}`)

      switch (args[0]) {
        case 'logout': {
          embed.setTitle('Logging out..')
          const message = await msg.channel.send({ embed })
          await message.delete(5000)
          return client.destroy()
        }

        case 'restart': {
          embed.setTitle('Restarting..')
          const message = await msg.channel.send({ embed })
          await message.delete(5000)
          return process.exit()
        }

        case 'uptime': {
          const upTime = client.utils.millisecondsToTime(client.uptime)
          embed.setTitle(`Up for ${upTime}`)
          const message = await msg.channel.send({ embed })
          return message.delete(10000)
        }
        default:
          break
      }
    }
  }
}
module.exports = BotManagement
