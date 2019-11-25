const Command = require('../../core/Command')

class Reload extends Command {
  constructor(client) {
    super(client, {
      name: 'reload',
      category: 'Bot Utils',
      description: 'Reloads Commands',
      aliases: ['reset', 'flush'],
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { warningMessage, standardMessage } = Utils

    // * ------------------ Logic --------------------

    const module = args[0]

    if (!module) {
      const msg1 = await standardMessage(msg, `Reloading all modules..`)
      await msg.context.reloadCommands()
      return msg1.edit(standardMessage(msg, `Reloading all modules.. done!`))
    }

    const run = await msg.context.reloadCommand(module)

    if (run) return warningMessage(msg, `Reloaded ${module}`)

    return warningMessage(msg, `Module [${module}] doesn't exist!`)
  }
}

module.exports = Reload
