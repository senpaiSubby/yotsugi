const Command = require('../../core/Command')
const { RichEmbed } = require('discord.js')
const config = require('../../data/config')
const { prefix } = config.general

class Rules extends Command {
  constructor(client) {
    super(client, {
      name: 'rules',
      category: 'General',
      description: 'Behold the rule book.'
    })
  }

  async run(msg, args, api) {
    const rules = ['1. Dont be a dick', '2. NO REPORTING!']
    const embed = new RichEmbed().setTitle('Rules').setDescription(rules.join('\n'))
    return msg.reply({ embed }).then((msg) => msg.delete(10000))
  }
}

module.exports = Rules
