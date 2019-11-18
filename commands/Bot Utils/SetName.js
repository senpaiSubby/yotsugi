
const Command = require('../../core/Command')

class SetName extends Command {
  constructor(client) {
    super(client, {
      name: 'setname',
      category: 'Bot Utils',
      description: 'Set the bot username',
      usage: 'setname Subby the great',
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    const username = args.join(' ')
    return client.user
      .setUsername(username)
      .then((user) => console.log(`--> New username set: ${user.username}`))
  }
}
module.exports = SetName
