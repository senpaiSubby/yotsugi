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
    const { channel } = msg

    // * ------------------ Logic --------------------

    const embed = Utils.embed(msg)

    const npmv = await worker.process('npm -v').death()

    embed.setTitle(`${user.username} Status`)
    embed.setThumbnail(user.avatarURL)
    embed.addField('Uptime', duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
    embed.addField(
      'Memory Usage',
      `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      true
    )
    embed.addField('Node Version', process.version.replace('v', ''), true)
    embed.addField('NPM Version', npmv.data.replace('\n', ''), true)
    embed.addField('Servers', client.guilds.size, true)
    embed.addField('Commands', msg.context.commands.size, true)
    embed.setDescription(
      `SubbyBot! Created by CallMeKory because I was bored lmao [GITHUB](https://github.com/callmekory/subbyBot)`
    )

    return channel.send({ embed })
  }
}
module.exports = Info
