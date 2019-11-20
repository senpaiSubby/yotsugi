const moment = require('moment')
require('moment-duration-format')
const worker = require('core-worker')
const Command = require('../../../core/Command')

class BotManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'bot',
      category: 'Bot Utils',
      description: 'Performs bot related functions.',
      usage: `bot logout | bot restart | bot uptime | bot status`,
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    const { Utils, user } = client
    const { channel, author } = msg

    const embed = Utils.embed(msg)

    switch (args[0]) {
      case 'restart': {
        embed.setTitle('Restarting..')
        const message = await channel.send({ embed })
        await message.delete(10000)
        return process.exit()
      }

      case 'uptime': {
        const upTime = Utils.millisecondsToTime(client.uptime)
        embed.setTitle(`Up for ${upTime}`)
        const message = await channel.send({ embed })
        return message.delete(10000)
      }

      case 'status': {
        const npmv = await worker.process('npm -v').death()

        embed.setTitle(`${user.username} Status`)
        embed.setThumbnail(user.avatarURL)
        embed.addField('Uptime', moment.duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
        embed.addField(
          'Memory Usage',
          `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          true
        )
        embed.addField('Node Version', process.version.replace('v', ''), true)
        embed.addField('NPM Version', npmv.data.replace('\n', ''), true)
        embed.addField('Servers', client.guilds.size, true)
        embed.addField('Commands', msg.context.commands.size, true)
        embed.setFooter(`Created by https://github.com/callmekory`)
        // .addField('Users', client.users.size, true)

        return channel.send({ embed })
      }
      case 'ping': {
        embed.setFooter(`Requested by: ${author.username}`, author.avatarURL)
        embed.setTitle(`Pong! Your ping is ${Date.now() - msg.createdTimestamp} ms`)
        return channel.send({ embed })
      }
      default:
        break
    }
  }
}
module.exports = BotManagement
