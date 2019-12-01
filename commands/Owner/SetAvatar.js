const Command = require('../../core/Command')

module.exports = class SetAvatar extends Command {
  constructor(client) {
    super(client, {
      name: 'setavatar',
      category: 'Owner',
      description: 'Set the bot avatar',
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
