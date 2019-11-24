const Command = require('../../core/Command')

class Percentage extends Command {
  constructor(client) {
    super(client, {
      name: 'percentage',
      category: 'Utils',
      description: 'Gets the percentage of numbers',
      usage: 'percent 5 100',
      aliases: ['percent']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { standardMessage } = Utils

    const amount = args[0]
    const maximum = args[1]
    const percentage = (amount / maximum) * 100

    return standardMessage(msg, `${args[0]} percent of ${args[1]} is ${percentage}`)
  }
}
module.exports = Percentage
