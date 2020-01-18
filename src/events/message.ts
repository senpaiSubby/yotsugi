import { NezukoMessage } from 'typings'

import { NezukoClient } from '../core/NezukoClient'

export const onMessage = async (msg: NezukoMessage, client: NezukoClient) =>
  client.commandManager.handleMessage(msg, client, true)
