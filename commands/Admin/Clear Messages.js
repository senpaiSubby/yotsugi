const Command = require('../../core/Command')

class ClearMessages extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      category: 'Admin',
      description: 'Removes # of messages',
      usage: `clear <0-100>`,
      aliases: ['delete', 'rm', 'purge'],
      guildOnly: true,
      args: true,
      permsNeeded: ['MANAGE_MESSAGES']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { channel } = msg

    if (args[0] === '1') args[0] = 2

    //* if sent from a DM dont run
    if (channel.type === 'dm') return
    const amount = args[0] //* Amount of messages which should be deleted

    if (typeof amount !== 'number') {
      return channel
        .send(Utils.embed(msg).setDescription('The amount parameter isn`t a number!'))
        .then((m) => {
          m.delete(10000)
        }) //* Checks if the `amount` parameter is a number. If not, the command throws an error
    }

    if (amount > 100) {
      return channel
        .send(Utils.embed(msg).setDescription('You can`t delete more than 100 messages at once!'))
        .then((m) => {
          m.delete(10000)
        }) //* Checks if the `amount` integer is bigger than 100
    }

    if (amount < 1) {
      return channel
        .send(Utils.embed(msg).setDescription('You have to delete at least 1 msg!'))
        .then((m) => {
          m.delete(10000)
        })
    }

    await channel.fetchMessages({ limit: amount }).then((messages) => {
      //* Fetches the messages
      return channel.bulkDelete(
        messages //* Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
      )
    })
  }
}
module.exports = ClearMessages
