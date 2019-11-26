const Command = require('../../core/Command')

class SetAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'setavatar',
      category: 'Bot Utils',
      description: 'Sets the bot avatar',
      usage: ['setavatar <image url>'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    await msg.delete()

    const a = await client.user.setAvatar(args[1])
    return console.log(`--> New avatar: ${a.avatarURL}`)
  }
}
module.exports = SetAvatar
