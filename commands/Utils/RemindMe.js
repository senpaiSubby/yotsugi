const ms = require('ms')
const Command = require('../../core/Command')

class RemindMe extends Command {
  constructor(client) {
    super(client, {
      name: 'remindme',
      category: 'Utils',
      description: 'Sets a reminder with a message',
      usage: [
        'remindme 10s do the dishes',
        'remindme 1h make memes',
        'remindme 1m get funky with it'
      ]
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { standardMessage, embed } = Utils
    const { author, channel } = msg

    msg.delete(10000)
    await channel.stopTyping()

    const Timer = args[0]
    const notice = args.splice(1, 1000).join(' ')

    const m = await standardMessage(
      msg,
      `:white_check_mark:  I'll DM you in [${ms(ms(Timer), {
        long: true
      })}] to [${notice}]`
    )

    m.delete(10000)

    setTimeout(() => {
      return author.send(
        embed(msg).setDescription(
          `It's been **${ms(ms(Timer), {
            long: true
          })}** Here's your reminder to **${notice}**`
        )
      )
    }, ms(Timer))
  }
}
module.exports = RemindMe
