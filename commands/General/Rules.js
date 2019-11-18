
const { RichEmbed } = require('discord.js')
const Command = require('../../core/Command')

class Rules extends Command {
  constructor(client) {
    super(client, {
      name: 'rules',
      category: 'General',
      description: 'Behold the rule book.'
    })
  }

  async run(client, msg) {
    const rules = ['1. Dont be a dick', '2. NO REPORTING!']
    const embed = new RichEmbed().setTitle('Rules').setDescription(rules.join('\n'))
    return msg.reply({ embed }).then((m) => m.delete(10000))
  }
}

module.exports = Rules
