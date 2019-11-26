const Command = require('../../core/Command')

class GetServerInvite extends Command {
  constructor(client) {
    super(client, {
      name: 'bd',
      category: 'Owner',
      description: 'Creates invite to any guild the bot is on',
      usage: 'bd <guild ID>',
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { warningMessage, errorMessage } = Utils
    const { channel } = msg

    // * ------------------ Usage Logic --------------------

    const guild = client.guilds.get(args[0])
    if (!guild) return errorMessage(msg, "The bot isn't in the guild with this ID.")

    const invites = await guild.fetchInvites()

    const list = invites.map((invite) => invite.code)

    if (list.length)
      return channel.send(
        Utils.embed(msg)
          .setTitle('I found the following existing invites')
          .setDescription(`**- https://discord.gg/${list.join('\n- https://discord.gg/')}**`)
      )

    const invitechannels = guild.channels.filter((c) =>
      c.permissionsFor(guild.me).has('CREATE_INSTANT_INVITE')
    )
    if (!invitechannels)
      return warningMessage(msg, 'No Channels found with permissions to create Invite in!')

    const newInvite = await invitechannels.random().createInvite()
    return channel.send(
      Utils.embed(msg)
        .setTitle('I created a new invite')
        .setDescription(`**- ${newInvite}**`)
    )
  }
}

module.exports = GetServerInvite
