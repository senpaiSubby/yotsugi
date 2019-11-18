const { Client } = require('discord.js')
const shell = require('shelljs')
const config = require('./data/config')

// clear terminal
shell.exec('clear')

// Initialise
const client = new Client()

client.config = config
client.dateFormat = require('dateformat')
client.Log = require('./core/utils/Logger')
client.Utils = require('./core/utils/Utils')

module.exports = { client }

// setup event handlers
const eventFiles = client.Utils.findNested('./events', '.js')
eventFiles.forEach((file) => {
  require(file)
})

//client.on('messageReactionRemove')

process.on('uncaughtException', (err) => {
  client.Log(err && err.stack ? err.stack : err)
})

// login
client.login(config.general.token)
