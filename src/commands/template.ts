/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { BotClient } from 'core/BotClient'
import { NezukoMessage } from 'typings'

import { Command } from '../core/base/Command'

export default class Template extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: [],
      args: true,
      category: '',
      description: 'Template',
      disabled: true,
      guildOnly: true,
      name: 'template',
      ownerOnly: true,
      usage: [],
      webUI: false
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // Logic
  }
}
