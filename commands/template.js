/* eslint-disable class-methods-use-this */
const Command = require('../core/Command')
//const Command = require('../../core/Command')

class Template extends Command {
  constructor(client) {
    super(client, {
      name: 'template',
      category: '',
      description: 'Template',
      usage: '|',
      aliases: [],
      args: true,
      disabled: false,
      ownerOnly: true,
      guildOnly: true,
      webUI: false
    })
  }

  async run(client, msg, args, api) {
    //
  }
}
module.exports = Template
