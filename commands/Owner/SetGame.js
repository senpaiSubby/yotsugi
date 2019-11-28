const Command = require('../../core/Command')

module.exports = class SetGame extends Command {
  constructor(client) {
    super(client, {
      name: 'setgame',
      category: 'Owner',
      description: 'Sets the game the bot is playing',
      usage: ['setgame <status>'],
      aliases: ['setstatus'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    await msg.delete()

    const gameName = args.join(' ')

    await client.user.setActivity(gameName)
    return console.log(`--> Game set: ${gameName}`)
  }
}
