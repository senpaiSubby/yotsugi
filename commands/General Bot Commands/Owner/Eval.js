const Command = require('../../../core/Command')

class Evaluator extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      category: 'Owner',
      description: 'Evals Code',
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    const { channel } = msg

    const regex = new RegExp(
      client.config.token
        .replace(/\./g, '\\.')
        .split('')
        .join('.?'),
      'g'
    )

    const input = `📥 **Input:**\n\`\`\`js\n${args.join(' ')}\n\`\`\``
    const error = (err) =>
      `🚫 **Error:**\n\`\`\`js\n${err.toString().replace(regex, '[Token]')}\n\`\`\``

    try {
      let output = eval(args.join(' '))

      if (typeof output !== 'string') output = require('util').inspect(output, { depth: 1 })
      const response = `📤 **Output:**\n\`\`\`js\n${output.replace(regex, '[Token]')}\n\`\`\``
      if (input.length + response.length > 1900) throw new Error('Output too long!')
      return channel
        .send(`${input}\n${response}`)
        .catch((err) => channel.send(`${input}\n${error(err)}`))
    } catch (err) {
      return channel
        .send(`${input}\n${error(err)}`)
        .catch((e) => channel.send(`${input}\n${error(e)}`))
    }
  }
}

module.exports = Evaluator
