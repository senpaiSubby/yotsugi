const Command = require('../../core/Command')

class SpaceText extends Command {
  constructor(client) {
    super(client, {
      name: 'space',
      category: 'Fun',
      description: "Spaces out text to look all dramatic n' stuff",
      usage: 'space <text>',
      args: true,
      guildOnly: true
    })
  }

  async run(client, msg, args) {
    msg.delete()
    const amount = 2

    return msg.channel.send(
      `**${args
        .join(' '.repeat(amount / 2))
        .split('')
        .join(' '.repeat(amount))}
    **`
    )
  }
}
module.exports = SpaceText
