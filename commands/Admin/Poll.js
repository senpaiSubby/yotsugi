const Command = require('../../core/Command')

module.exports = class Poll extends Command {
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

    const { embed } = client.Utils

    // * ------------------ Logic --------------------

    const pollembed = embed('green')
      .setFooter('React to vote')
      .setDescription(args.join(' '))
      .setTitle(`Poll created by ${msg.author.username}`)
      .setTimestamp(msg.createdAt)
    const m = await msg.channel.send(pollembed)

    await m.react('✅')
    await m.react('❌')
    await msg.delete({ timeout: 1000 })
  }
}
