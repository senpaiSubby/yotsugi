const { client } = require('../index')
const SubprocessManager = require('../core/SubprocessManager')

// Hande ready event
client.once('ready', async () => {
  const { Log, user, config } = client
  Log.info('Client Ready', `Connected as ${user.username}`)

  await user.setActivity(`${config.prefix}`, { type: 'LISTENING' })

  // load Subprocesses
  const Subprocesses = new SubprocessManager(client)
  Subprocesses.loadModules('./subprocesses/')
})
