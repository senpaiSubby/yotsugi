/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
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
    // eslint-disable-next-line no-param-reassign
    if (args[0] === '1') args[0] = 2

    // .setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    //* if sent from a DM dont run
    if (msg.channel.type === 'dm') return
    const amount = args[0] //* Amount of messages which should be deleted
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(amount)) {
      return msg.channel
        .send({ embed: { title: 'The amount parameter isn`t a number!' } })
        .then((m) => {
          m.delete(5000)
        }) //* Checks if the `amount` parameter is a number. If not, the command throws an error
    }
    if (amount > 100) {
      return msg.channel
        .send({
          embed: { title: 'You can`t delete more than 100 messages at once!' }
        })
        .then((m) => {
          m.delete(5000)
        }) //* Checks if the `amount` integer is bigger than 100
    }
    if (amount < 1) {
      return msg.channel
        .send({ embed: { title: 'You have to delete at least 1 msg!' } })
        .then((m) => {
          m.delete(5000)
        })
    }
    await msg.channel.fetchMessages({ limit: amount }).then((messages) => {
      //* Fetches the messages
      return msg.channel.bulkDelete(
        messages //* Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
      )
    })
  }
}
module.exports = ClearMessages
