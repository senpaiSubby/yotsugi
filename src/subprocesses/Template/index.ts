/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'

export default class Template extends Subprocess {
  constructor() {
    super({
      name: 'Template',
      description: 'Template',
      disabled: true
    })
  }

  public async run(client: BotClient) {}
}
