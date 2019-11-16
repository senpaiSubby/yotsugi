const Command = require('../../core/Command')

class Evaluator extends Command {
  constructor(client) {
    super(client, {
      name: 'Eval',
      category: 'Owner',
      description: 'Evals Code',
      args: true,
      ownerOnly: true
    })
  }

  async run(msg, args, api) {
    const regex = new RegExp(
      this.client.config.general.token
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
      return msg.channel
        .send(`${input}\n${response}`)
        .catch((err) => msg.channel.send(`${input}\n${error(err)}`))
    } catch (err) {
      return msg.channel
        .send(`${input}\n${error(err)}`)
        .catch((err) => msg.channel.send(`${input}\n${error(err)}`))
    }
  }
}

module.exports = Evaluator
