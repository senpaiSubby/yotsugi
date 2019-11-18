const chalk = require('chalk')
const { client } = require('../index')

const SubprocessManager = require('../core/SubprocessManager')

const Subprocesses = new SubprocessManager(client)

client.once('ready', async () => {
  const { prefix } = client.config.general
  client.Log.info(chalk.green(`${chalk.yellow(client.user.username)}'s lazers ready to fire.`))
  client.user.setActivity(`${prefix}help`)
  Subprocesses.loadModules('./core/subprocesses/')
})
