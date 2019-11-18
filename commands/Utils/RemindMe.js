
const ms = require('ms')
const Command = require('../../core/Command')

class RemindMe extends Command {
  constructor(client) {
    super(client, {
      name: 'remindme',
      category: 'Utils',
      description: 'Sets a reminder with a message',
      usage: 'remindme 10s do the dishes | remindme 1h make memes | remindme 1m get funky with it'
    })
  }

  async run(client, msg, args) {
    msg.delete(10000)
    msg.channel.stopTyping()
    const Timer = args[0]
    const notice = args.splice(1, 1000).join(' ')

    msg.channel
      .send({
        embed: {
          title: `:white_check_mark:  I'll DM you in: **${ms(ms(Timer), {
            long: true
          })}** to **${notice}**`
        }
      })
      .then((m) => m.delete(5000))

    setTimeout(() => {
      return msg.author.send({
        embed: {
          title: `It's been **${ms(ms(Timer), {
            long: true
          })}** Here's your reminder to **${notice}**`
        }
      })
    }, ms(Timer))
  }
}
module.exports = RemindMe
