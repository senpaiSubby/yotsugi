/* eslint-disable class-methods-use-this */
const { exec } = require('child_process')
const { inspect } = require('util')
const Command = require('../../core/Command')

class Executor extends Command {
  constructor(client) {
    super(client, {
      name: 'exec',
      category: 'Owner',
      description: 'Executes shell commands',
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    const regex = new RegExp(
      client.config.general.token
        .replace(/\./g, '\\.')
        .split('')
        .join('.?'),
      'g'
    )

    const input = `📥 **Input:**\n\`\`\`sh\n${args.join(' ')}\n\`\`\``
    const error = (err) =>
      `🚫 **Error:**\n\`\`\`sh\n${err.toString().replace(regex, '[Token]')}\n\`\`\``

    // eslint-disable-next-line global-require
    exec(args.join(' '), (stderr, stdout) => {
      if (stderr) {
        return msg.channel
          .send(`${input}\n${error(stderr)}`)
          .catch((err) => msg.channel.send(`${input}\n${error(err)}`))
      }
      // eslint-disable-next-line no-param-reassign
      if (typeof output !== 'string') stdout = inspect(stdout, { depth: 1 })
      const response = `📤 **Output:**\n\`\`\`sh\n${stdout.replace(regex, '[Token]')}\n\`\`\``
      if (input.length + response.length > 1900) throw new Error('Output too long!')
      return msg.channel
        .send(`${input}\n${response}`)
        .catch((err) => msg.channel.send(`${input}\n${error(err)}`))
    })
  }
}

module.exports = Executor
