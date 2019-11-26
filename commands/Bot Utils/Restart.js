const Command = require('../../core/Command')

class restart extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      category: 'Bot Utils',
      description: 'Restarts the bot.',
      ownerOnly: true
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { embed } = Utils

    // * ------------------ Logic --------------------
    let count = 10

    const m = await msg.channel.send(
      embed(msg, 'yellow').setDescription(`Restarting in ${count} seconds..`)
    )
    const interval = setInterval(async () => {
      if (count === 0) {
        await m.edit(embed(msg, 'yellow').setDescription(`Restarting..`))
        clearInterval(interval)
        return process.exit()
      }
      count--
      await m.edit(embed(msg, 'yellow').setDescription(`Restarting in ${count} seconds..`))
    }, 1000)
  }
}
module.exports = restart
