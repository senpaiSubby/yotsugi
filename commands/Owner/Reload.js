const Command = require('../../core/Command')

module.exports = class Reload extends Command {
  constructor(client) {
    super(client, {
      name: 'reload',
      category: 'Owner',
      description: 'Reloads Commands',
      aliases: ['reset', 'flush'],
      ownerOnly: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { warningMessage, standardMessage } = client.Utils
    const { context } = msg

    // * ------------------ Logic --------------------

    const module = args[0]

    if (!module) {
      const msg1 = await standardMessage(msg, `Reloading all modules..`)
      await context.reloadCommands()
      return msg1.edit(standardMessage(msg, `Reloading all modules.. done!`))
    }

    const run = await context.reloadCommand(module)

    if (run) return warningMessage(msg, `Reloaded ${module}`)

    return warningMessage(msg, `Module [ ${module} ] doesn't exist!`)
  }
}
