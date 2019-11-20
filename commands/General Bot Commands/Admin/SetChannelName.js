const Command = require('../../../core/Command')

class SetChannelName extends Command {
  constructor(client) {
    super(client, {
      name: 'channelname',
      category: 'Admin',
      description: 'Sets a channel name',
      usage: 'cname <channelID> <newName>',
      aliases: ['cname'],
      args: true,
      guildOnly: true,
      permsNeeded: ['MANAGE_CHANNELS']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client

    const channel = args.shift()
    const newName = args.join(' ').replace(/ /g, '\u2009')

    client.channels.get(channel).setName(newName)
    const embed = Utils.embed(msg).setDescription(`Channel name changed to ${newName}`)
    msg.channel.send({ embed })
  }
}
module.exports = SetChannelName
