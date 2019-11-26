const Command = require('../../core/Command')

class Poll extends Command {
  constructor(client) {
    super(client, {
      name: 'poll',
      category: 'Admin',
      description: 'Template',
      usage: ['poll <whats the poll for?>'],
      permsNeeded: ['ADMINISTRATOR']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { embed } = Utils

    // * ------------------ Logic --------------------

    const pollembed = embed(msg)
      .setFooter('React to vote')
      .setDescription(args.join(' '))
      .setTitle(`Poll created by ${msg.author.username}`)
      .setTimestamp(msg.createdAt)
    const m = await msg.channel.send(pollembed)

    await m.react('✅')
    await m.react('❌')
    msg.delete({ timeout: 1000 })
  }
}
module.exports = Poll
