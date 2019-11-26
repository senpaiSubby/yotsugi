const { client } = require('../index')

const SubprocessManager = require('../core/SubprocessManager')

client.once('ready', async () => {
  client.Log.info('Client Ready', `Connected as ${client.user.username}`)
  client.user.setActivity(`on ${client.guilds.size} servers`)

  // load Subprocesses
  const Subprocesses = new SubprocessManager(client)
  Subprocesses.loadModules('../subprocesses/')
})
