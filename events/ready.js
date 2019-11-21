const { client } = require('../index')

const SubprocessManager = require('../core/SubprocessManager')

const Subprocesses = new SubprocessManager(client)

client.once('ready', async () => {
  client.Log.info('Client Ready', `Connected as ${client.user.username}`)
  client.user.setActivity(`on ${client.guilds.size} servers`)
  Subprocesses.loadModules('./core/subprocesses/')
})
