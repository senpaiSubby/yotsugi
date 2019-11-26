const Command = require('../../core/Command')

class SetChannelName extends Command {
  constructor(client) {
    super(client, {
      name: 'cname',
      category: 'Admin',
      description: 'Sets a channel name',
      usage: ['cname <channelID> <newName>'],
      aliases: ['channelname'],
      args: true,
      guildOnly: true,
      permsNeeded: ['MANAGE_CHANNELS']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { standardMessage } = Utils

    // * ------------------ Logic --------------------

    const channel = args.shift()
    const newName = args.join(' ').replace(/ /g, '\u2009')

    await client.channels.get(channel).setName(newName)
    return standardMessage(msg, `Channel name changed to ${newName}`)
  }
}
module.exports = SetChannelName
