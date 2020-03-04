/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage } from 'typings'
import { NezukoClient } from '../core/NezukoClient'
import { Verify } from '../core/Verify'

export const onMessage = async (msg: NezukoMessage, client: NezukoClient) => {
  await Verify.member(msg)
  await client.commandManager.handleMessage(msg, client, true)
}
