/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const Command = require('../../core/Command')

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
    const gameName = args.join(' ')

    return client.user
      .setActivity(gameName)
      .then(() => console.log(`--> Game set: ${gameName}`))
      .catch(console.error)
  }
}
module.exports = SetGame
