const { client } = require('../index')
const SubprocessManager = require('../core/SubprocessManager')

// Hande ready event
client.once('ready', async () => {
  const { Log, user, guilds } = client
  Log.info('Client Ready', `Connected as ${user.username}`)
  user.setActivity(`on ${guilds.size} servers`)

  // load Subprocesses
  const Subprocesses = new SubprocessManager(client)
  Subprocesses.loadModules('../subprocesses/')
})
