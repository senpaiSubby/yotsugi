const { Client } = require('discord.js')
const { exec } = require('shelljs')
const config = require('./data/config')
const Database = require('./core/Database')

// clear terminal
exec('clear')

// Initialise
const client = new Client()

client.config = config
client.Log = require('./core/utils/Log')
client.Utils = require('./core/utils/Utils')

client.db = []
client.generalConfig = Database.Models.generalConfig
client.serverConfig = Database.Models.serverConfig
client.memberConfig = Database.Models.memberConfig

client.colors = {
  red: '#fb4934',
  green: '#8ec07c',
  blue: '#83a598',
  yellow: '#fabd2f',
  orange: '#d79921',
  white: '#ebdbb2',
  black: '#282828',
  grey: '#928374'
}

module.exports = { client }

// setup event handlers
const eventFiles = client.Utils.findNested('./events', '.js')
eventFiles.forEach((file) => {
  require(file)
})

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason) => client.Log.error('Unhandled Rejection', reason, true))

// Unhandled Errors
process.on('uncaughtException', (error) => client.Log.error('Uncaught Exception', error, true))

// login
client.login(config.token)
