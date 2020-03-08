/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class Executor extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'exec',
      category: 'Bot Utils',
      description: 'Run shell commands',
      ownerOnly: true,
      args: true,
      usage: ['exec <command>']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { channel } = msg
    const { execAsync } = client.Utils

    // * ------------------ Usage Logic --------------------

    const regex = new RegExp(
      client.config.token
        .replace(/\./g, '\\.')
        .split('')
        .join('.?'),
      'g'
    )

    const input = `📥 **Input:**\n\`\`\`sh\n${args.join(' ')}\n\`\`\``
    const error = (err) =>
      `🚫 **Error:**\n\`\`\`sh\n${err
        .toString()
        .replace(regex, '[Token]')}\n\`\`\``

    const { stdout, stderr } = await execAsync(args.join(' '), {
      silent: false
    })

    if (stderr) {
      try {
        return channel.send(`${input}\n${error(stderr)}`)
      } catch (err) {
        return channel.send(`${input}\n${error(err)}`)
      }
    }

    const response = `📤 **Output:**
    \`\`\`sh\n${stdout.replace(regex, '[Token]')}\n\`\`\``
    try {
      return channel.send(`${input}\n${response}`, { split: true })
    } catch (err) {
      return channel.send(`${input}\n${error(err)}`)
    }
  }
}
