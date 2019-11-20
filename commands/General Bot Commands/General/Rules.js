const Command = require('../../../core/Command')

class Rules extends Command {
  constructor(client) {
    super(client, {
      name: 'rules',
      category: 'General',
      description: 'Behold the rule book.'
    })
  }

  async run(client, msg) {
    const { Utils } = client

    const rules = ['1. Dont be a dick', '2. NO REPORTING!']
    const embed = Utils.embed(msg)
      .setTitle('Rules')
      .setDescription(rules.join('\n'))
    const m = await msg.reply({ embed })
    return m.delete(10000)
  }
}

module.exports = Rules
