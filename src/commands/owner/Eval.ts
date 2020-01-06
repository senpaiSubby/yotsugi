/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'
import { NezukoMessage } from 'typings'

export default class Evaluator extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'eval',
      category: 'Owner',
      description: 'Eval javascript code',
      ownerOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { channel } = msg

    // * ------------------ Usage Logic --------------------

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
      let output = await eval(args.join(' '))

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
