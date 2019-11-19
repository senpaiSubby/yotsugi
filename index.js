const { Client } = require('discord.js')
const shell = require('shelljs')
const config = require('./data/config')

// clear terminal
shell.exec('clear')

// Initialise
const client = new Client()

client.config = config
client.dateFormat = require('dateformat')
client.Log = require('./core/utils/Log')
client.Utils = require('./core/utils/Utils')

client.colors = {
  red: '#cc241d',
  green: '#b8bb26',
  blue: '#458588',
  yellow: '#d79921'
}

module.exports = { client }

// setup event handlers
const eventFiles = client.Utils.findNested('./events', '.js')
eventFiles.forEach((file) => {
  require(file)
})

//client.on('messageReactionRemove')

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason) => client.Log.error('Unhandled Rejection', reason, true))

// Unhandled Errors
process.on('uncaughtException', (error) => client.Log.error('Uncaught Exception', error, true))

// login
client.login(config.general.token)
