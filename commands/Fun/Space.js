const Command = require('../../../noelleBot/core/Command')

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
    // * ------------------ Setup --------------------

    const { channel } = msg

    // * ------------------ Logic --------------------

    const amount = 2

    return channel.send(
      `**${args
        .join(' '.repeat(amount / 2))
        .split('')
        .join(' '.repeat(amount))}
    **`
    )
  }
}
module.exports = SpaceText
