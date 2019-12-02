const CommandManager = require('../core/CommandManager')
const { client } = require('../index')

// Load commands
const Manager = new CommandManager(client)
Manager.loadCommands(`${__dirname}/../commands`)

// Handle messages
client.on('message', (message) => Manager.handleMessage(message, client))
client.on('messageUpdate', (old, _new) => {
  if (old.content !== _new.content) Manager.handleMessage(_new, client)
})

module.exports = { Manager }
