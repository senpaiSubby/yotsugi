/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { SubprocessManager } from '../core/SubprocessManager'
import { client } from '../index'

// Hande ready event
client.once('ready', async () => {
  const { Logger, user, config } = client
  Logger.ok('Client Ready', `Connected as [ ${user.username} ]`)

  await user.setActivity(`${config.prefix}`, { type: 'LISTENING' })

  // Load Subprocesses
  const subprocesses = new SubprocessManager(client)
  subprocesses.loadModules(`${__dirname}/../subprocesses`)
})
