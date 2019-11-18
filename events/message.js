const CommandManager = require('../core/CommandManager')
const { client } = require('../index')

const Manager = new CommandManager(client)

Manager.loadCommands('./commands')

client.on('message', (message) => Manager.handleMessage(message, client))
client.on('messageUpdate', (old, _new) => {
  if (old.content !== _new.content) Manager.handleMessage(_new, client)
})

module.exports = { Manager }
