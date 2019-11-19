const { exec } = require('shelljs')

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
    const { channel } = msg
    const { Utils } = client

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

    exec(Utils.makeShellSafe(args.join(' ')), { silent: true }, async (code, stdout, stderr) => {
      if (stderr) {
        return channel
          .send(`${input}\n${error(stderr)}`)
          .catch((err) => channel.send(`${input}\n${error(err)}`))
      }

      const response = `📤 **Output:**\n\`\`\`sh\n${stdout.replace(regex, '[Token]')}\n\`\`\``
      return channel
        .send(`${input}\n${response}`, { split: true })
        .catch((err) => channel.send(`${input}\n${error(err)}`))
    })
  }
}

module.exports = Executor
