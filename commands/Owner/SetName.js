const Command = require('../../core/Command')

module.exports = class SetName extends Command {
  constructor(client) {
    super(client, {
      name: 'setname',
      category: 'Owner',
      description: 'Set the bot username',
      usage: ['setname <new name>'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    await msg.delete()

    const username = args.join(' ')
    const u = await client.user.setUsername(username)
    return console.log(`--> New username set: ${u.username}`)
  }
}
