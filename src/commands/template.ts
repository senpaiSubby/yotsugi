/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Command } from '../core/base/Command'
import { NezukoClient } from 'core/NezukoClient'
import { NezukoMessage } from 'typings'

export default class Template extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'template',
      category: '',
      description: 'Template',
      usage: [],
      aliases: [],
      args: true,
      disabled: true,
      ownerOnly: true,
      guildOnly: true,
      webUI: false
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api: boolean) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { author, channel } = msg
    // * ------------------ Config --------------------
    // * ------------------ Check Config --------------------

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------
  }
}
