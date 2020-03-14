/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

/**
 * Command to evaluate javascript code
 */
export default class Evaluator extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Bot Utils',
      description: 'Eval Javascript code',
      name: 'eval',
      ownerOnly: true,
      usage: ['eval [command]']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { channel } = msg

    // * ------------------ Usage Logic --------------------

    const clean = (text) => {
      if (typeof text === 'string') {
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
      }
      return text
    }

    try {
      const code = args.join(' ')
      let evaled = await eval(code)

      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)

      return channel.send(clean(evaled), { code: 'xl' })
    } catch (err) {
      return channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
    }
  }
}
