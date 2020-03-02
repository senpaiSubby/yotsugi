import { NezukoMessage } from 'typings'
import { Verify } from '../core/utils/Verify'
import { NezukoClient } from '../core/NezukoClient'

export const onMessage = async (msg: NezukoMessage, client: NezukoClient) => {
  await Verify.member(msg)
  client.commandManager.handleMessage(msg, client, true)
}
