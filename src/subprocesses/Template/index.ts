/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoClient } from '../../core/NezukoClient'
import { Subprocess } from '../../core/base/Subprocess'

export default class Template extends Subprocess {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'Template',
      description: 'Template',
      disabled: true
    })

    this.client = client
  }

  public async run() {}
}
