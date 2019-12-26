const { client } = require('../../nezuko')
const SubprocessManager = require('../core/SubprocessManager')

// Hande ready event
client.once('ready', async () => {
  const { Logger, user, config } = client
  Logger.ok('Client Ready', `Connected as [ ${user.username} ]`)

  await user.setActivity(`${config.prefix}`, { type: 'LISTENING' })

  // load Subprocesses
  const Subprocesses = new SubprocessManager(client)
  Subprocesses.loadModules(`${__dirname}/../subprocesses`)
})
