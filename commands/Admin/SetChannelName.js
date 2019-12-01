const Command = require('../../core/Command')

module.exports = class SetChannelName extends Command {
  constructor(client) {
    super(client, {
      name: 'cname',
      category: 'Admin',
      description: 'Rename channels',
      usage: ['cname <channelID> <newName>'],
      aliases: ['channelname'],
      args: true,
      guildOnly: true,
      permsNeeded: ['MANAGE_CHANNELS']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { standardMessage } = client.Utils

    // * ------------------ Logic --------------------

    const channel = args.shift()
    const newName = args.join(' ').replace(/ /g, '\u2009')

    await client.channels.get(channel).setName(newName)
    return standardMessage(msg, `Channel name changed to ${newName}`)
  }
}
