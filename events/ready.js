const client = require('../index')
const SubprocessManager = require('../core/SubprocessManager')
const chalk = require('chalk')

const Subprocesses = new SubprocessManager(client)

client.once('ready', async () => {
  const { prefix } = client.config.general

  // log that bot is ready
  client.logger.info(chalk.green(`${chalk.yellow(client.user.username)}'s lazers ready to fire.`))

  // set bot activity status
  client.user.setActivity(`${prefix}help`)

  // load subprocesses
  Subprocesses.loadModules('./core/subprocesses/')
})
