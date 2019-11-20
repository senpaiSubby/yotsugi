const Command = require('../../../core/Command')

class SetGame extends Command {
  constructor(client) {
    super(client, {
      name: 'setgame',
      category: 'Bot Utils',
      description: 'Sets the game the bot is playing',
      usage: 'setgame Minecraft',
      aliases: ['setstatus'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    msg.delete()

    const gameName = args.join(' ')

    await client.user.setActivity(gameName)
    return console.log(`--> Game set: ${gameName}`)
  }
}
module.exports = SetGame
