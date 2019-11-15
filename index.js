// Core
const { Client } = require('discord.js')
const config = require('./core/config.js')
const CommandManager = require('./core/CommandManager')

// Initialise
const client = new Client()
client.utils = require('./core/utils')

const Manager = new CommandManager(client)
//const Subprocesses = new SubprocessManager(client)

const onReady = () => {
  console.log('ready')
  //Subprocesses.loadModules('./subprocesses/')
}

Manager.loadCommands('./commands')

// Handle Discord
client.login(config.general.token)
client.once('ready', onReady)
client.on('message', (message) => Manager.handleMessage(message))
//client.on("messageUpdate", (old, _new) => {
//  if (old.content !== _new.content) Manager.handleMessage(_new);
//});

module.exports = client
