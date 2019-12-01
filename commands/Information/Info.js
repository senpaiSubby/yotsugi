const { duration } = require('moment')
require('moment-duration-format')
const worker = require('core-worker')
const Command = require('../../core/Command')

module.exports = class Info extends Command {
  constructor(client) {
    super(client, {
      name: 'info',
      category: 'Information',
      description: 'Info about Nezuko'
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { Utils, user } = client
    const { embed, execAsync } = Utils
    const { channel, context } = msg
    const { round } = Math
    const { memoryUsage } = process

    // * ------------------ Logic --------------------

    const npmv = await worker.process('npm -v').death()
    const {
      code,
      stdout
    } = await execAsync(
      'sloc --format json --exclude "node_modules|build" /home/sublime/git/nezuko',
      { silent: true }
    )
    const { byExt } = JSON.parse(stdout)

    return channel.send(
      embed('green')
        .setTitle(`Nezuko Status`)
        .setThumbnail(user.avatarURL)
        .addField('Uptime', duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
        .addField('Memory Usage', `${round(memoryUsage().heapUsed / 1024 / 1024)} MB`, true)
        .addField('Node Version', process.version.replace('v', ''), true)
        .addField('NPM Version', npmv.data.replace('\n', ''), true)
        .addField('Commands', context.commands.size, true)
        .addField('Lines of Code', byExt.js.summary.source, true)
        .setDescription(
          `Nezuko! Created to automate my life [GITHUB](https://github.com/callmekory/nezuko)`
        )
    )
  }
}
