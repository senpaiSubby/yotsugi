// Core
const { Client } = require('discord.js')
const config = require('./data/config')
const CommandManager = require('./core/CommandManager')
const SubprocessManager = require('./core/SubprocessManager')
const shell = require('shelljs')
const chalk = require('chalk')

// clear terminal
shell.exec('clear')

// Initialise
const client = new Client()

client.config = config
client.dateFormat = require('dateformat')
client.logger = require('./core/utils/errorLogger')
client.utils = require('./core/utils/utils')

const Manager = new CommandManager(client)
const Subprocesses = new SubprocessManager(client)
//client.Subprocesses = Subprocesses

const onReady = () => {
  const { username } = client.config.general
  // log that bot is ready
  client.logger.info(chalk.green(`${chalk.yellow(client.user.username)}'s lazers ready to fire.`))

  // set bot username
  if (client.user.username !== username) {
    client.user.setUsername(username)
    client.logger.info(chalk.white(`Username changed to ${chalk.yellow(username)}`))
  }

  // set bot activity status
  client.user.setActivity('my codebase burn. ;)', {
    type: 'watching'
  })
  Subprocesses.loadModules('./core/subprocesses/')
}

Manager.loadCommands('./commands')
// Handle Discord
client.login(config.general.token)
client.once('ready', onReady)
client.on('message', (message) => Manager.handleMessage(message))
client.on('messageUpdate', (old, _new) => {
  if (old.content !== _new.content) Manager.handleMessage(_new)
})

module.exports = { client, Manager }
