const { duration } = require('moment')
require('moment-duration-format')
const worker = require('core-worker')
const Command = require('../../core/Command')

module.exports = class Info extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      category: 'Information',
      description: 'Learn about the bot.'
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { Utils, user } = client
    const { embed } = Utils
    const { channel, context } = msg
    const { round } = Math
    const { memoryUsage } = process

    // * ------------------ Logic --------------------

    const npmv = await worker.process('npm -v').death()

    return channel.send(
      embed(msg)
        .setTitle(`Nezuko Status`)
        .setThumbnail(user.avatarURL)
        .addField('Uptime', duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
        .addField('Memory Usage', `${round(memoryUsage().heapUsed / 1024 / 1024)} MB`, true)
        .addField('Node Version', process.version.replace('v', ''), true)
        .addField('NPM Version', npmv.data.replace('\n', ''), true)
        .addField('Servers', client.guilds.size, true)
        .addField('Commands', context.commands.size, true)
        .setDescription(
          `Nezuko! Created to automate my life [GITHUB](https://github.com/callmekory/nezuko)`
        )
    )
  }
}
