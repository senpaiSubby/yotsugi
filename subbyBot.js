'use strict'
const Discord = require('discord.js')
const Enmap = require('enmap')
const shell = require('shelljs')
const fs = require('fs')
const config = require('./data/config.js')

const client = new Discord.Client({
  disableEveryone: false,
  restTimeOffset: 1000
})

client.commands = new Enmap()
client.utils = require('./lib/utils')
client.config = config
client.dateFormat = require('dateformat')

const setup = () => {
  //* load commands from ./commands folder
  const cmdFiles = client.utils.findNested('./commands', '.js')
  cmdFiles.forEach((file) => {
    const command = require(file)
    client.commands.set(command.help.name, command)
  })

  //* load events from ./events folder
  fs.readdir('./events/', (err, files) => {
    if (err) console.error(err)
    const jsFiles = files.filter((f) => f.split('.').pop() === 'js')
    jsFiles.forEach((f, i) => {
      require(`./events/${f}`)
    })
  })
}
setup()

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
