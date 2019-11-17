/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
const Command = require('../../core/Command')

class SetAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'setavatar',
      category: 'Bot Utils',
      description: 'Sets the bot avatar',
      usage: 'setavatar <image url>',
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    return client.user
      .setAvatar(args[1])
      .then((user) => console.log(`--> New avatar: ${user.avatarURL}`))
      .catch(console.error)
  }
}
module.exports = SetAvatar
