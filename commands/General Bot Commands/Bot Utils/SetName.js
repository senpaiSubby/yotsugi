const Command = require('../../../core/Command')

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
    msg.delete()

    const username = args.join(' ')
    const u = await client.user.setUsername(username)
    return console.log(`--> New username set: ${u.username}`)
  }
}
module.exports = SetName
