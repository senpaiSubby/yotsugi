const Command = require('../../core/Command')

class Executor extends Command {
  constructor(client) {
    super(client, {
      name: 'Exec',
      category: 'Owner',
      description: 'Executes shell commands',
      ownerOnly: true,
      args: true
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

    const input = `📥 **Input:**\n\`\`\`sh\n${args.join(' ')}\n\`\`\``
    const error = (err) =>
      `🚫 **Error:**\n\`\`\`sh\n${err.toString().replace(regex, '[Token]')}\n\`\`\``

    require('child_process').exec(args.join(' '), (stderr, stdout) => {
      if (stderr) {
        msg.channel
          .send(`${input}\n${error(stderr)}`)
          .catch((err) => msg.channel.send(`${input}\n${error(err)}`))
      } else {
        if (typeof output !== 'string') stdout = require('util').inspect(stdout, { depth: 1 })
        const response = `📤 **Output:**\n\`\`\`sh\n${stdout.replace(regex, '[Token]')}\n\`\`\``
        if (input.length + response.length > 1900) throw new Error('Output too long!')
        msg.channel
          .send(`${input}\n${response}`)
          .catch((err) => msg.channel.send(`${input}\n${error(err)}`))
      }
    })
  }
}

module.exports = Executor
