const Command = require('../../core/Command')

module.exports = class restart extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      category: 'Owner',
      description: 'Restarts the bot.',
      ownerOnly: true
    })
  }

  async run(client, msg) {
    // * ------------------ Setup --------------------

    const { embed } = client.Utils
    const { channel } = msg

    // * ------------------ Logic --------------------
    let count = 10

    const m = await channel.send(
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
