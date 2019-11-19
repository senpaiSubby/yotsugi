const moment = require('moment')
require('moment-duration-format')
const worker = require('core-worker')
const Command = require('../../core/Command')

class Status extends Command {
  constructor(client) {
    super(client, {
      name: 'status',
      category: 'Bot Utils',
      description: 'Subby Status',
      aliases: ['stats', 'uptime']
    })
  }

  async run(client, msg) {
    const { Utils } = client
    const { channel } = msg

    const npmv = await worker.process('npm -v').death()

    const embed = Utils.embed(msg)
      .setTitle(`${client.user.username} Status`)
      .setThumbnail(client.user.avatarURL)
      .addField('Uptime', moment.duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
      .addField(
        'Memory Usage',
        `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        true
      )
      .addField('Node Version', process.version.replace('v', ''), true)
      .addField('NPM Version', npmv.data.replace('\n', ''), true)
      .addField('Servers', client.guilds.size, true)
      .addField('Commands', msg.context.commands.size, true)
      .setFooter(`Created by https://github.com/callmekory`)
    // .addField('Users', client.users.size, true)

    return channel.send({ embed })
  }
}

module.exports = Status
