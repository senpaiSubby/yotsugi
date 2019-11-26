const { duration } = require('moment')
require('moment-duration-format')
const worker = require('core-worker')
const Command = require('../../core/Command')

class Info extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      category: 'General',
      description: 'Learn about the bot.'
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { Utils, user } = client
    const { embed } = Utils
    const { channel } = msg

    // * ------------------ Logic --------------------

    const npmv = await worker.process('npm -v').death()

    return channel.send(
      embed(msg)
        .setTitle(`${user.username} Status`)
        .setThumbnail(user.avatarURL)
        .addField('Uptime', duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
        .addField(
          'Memory Usage',
          `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          true
        )
        .addField('Node Version', process.version.replace('v', ''), true)
        .addField('NPM Version', npmv.data.replace('\n', ''), true)
        .addField('Servers', client.guilds.size, true)
        .addField('Commands', msg.context.commands.size, true)
        .setDescription(
          `SubbyBot! Created by CallMeKory because I was bored lmao [GITHUB](https://github.com/callmekory/subbyBot)`
        )
    )
  }
}
module.exports = Info
