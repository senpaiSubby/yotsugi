const Command = require('../../core/Command')

module.exports = class Clear extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      category: 'Admin',
      description: 'Removes # of messages',
      usage: [`clear <0-100>`, 'clear <@user> <0-100>'],
      aliases: ['delete', 'rm', 'purge'],
      guildOnly: true,
      args: true,
      permsNeeded: ['MANAGE_MESSAGES']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    await msg.delete()

    const { warningMessage } = client.Utils
    const { channel } = msg
    const user = msg.mentions.users.first()

    // * ------------------ Logic --------------------

    if (channel.type === 'dm') return
    const amount = user ? args[1] : args[0]

    if (user && isNaN(args[1])) return warningMessage(msg, 'The amount parameter isn`t a number!')

    if (!user && isNaN(args[0])) return warningMessage(msg, 'The amount parameter isn`t a number!')

    if (amount > 100) return warningMessage(msg, 'You can`t delete more than 100 messages at once!')

    if (amount < 1) return warningMessage(msg, 'You have to delete at least 1 msg!')

    let messages = await channel.fetchMessages({ limit: user ? 100 : amount })

    if (user) {
      const filterBy = user ? user.id : client.user.id
      messages = messages
        .filter((m) => m.author.id === filterBy)
        .array()
        .slice(0, amount)
    }
    return channel.bulkDelete(messages)
  }
}
