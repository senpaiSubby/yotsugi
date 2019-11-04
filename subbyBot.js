'use strict'
const Discord = require('discord.js')
const Enmap = require('enmap')
const shell = require('shelljs')
const config = require('./data/config.js')

const client = new Discord.Client({
  disableEveryone: false,
  restTimeOffset: 1000
})

client.commands = new Enmap()
client.utils = require('./lib/utils')
client.config = config
client.dateFormat = require('dateformat')
client.utils.setup(client)

//* clear terminal
shell.exec('clear')

process
  .on('unhandledRejection', (error) => console.log(`unhandledRejection:\n${error.stack}`))
  .on('uncaughtException', (error) => {
    console.log(`uncaughtException:\n${error.stack}`)
    process.exit() // better to exit here.
  })
  .on('error', (error) => console.log(`Error:\n${error.stack}`))
  .on('warn', (error) => console.log(`Warning:\n${error.stack}`))

//* export client for event handlers
module.exports = { client: client }

//* login and start the fires
client.login(config.general.token)
