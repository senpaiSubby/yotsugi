const Command = require('../../core/Command')

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      category: 'Information',
      description: 'Gets Help On Commands',
      aliases: ['halp'],
      guildOnly: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, serverConfig } = client
    const { embed, groupBy, paginate, capitalize } = Utils
    const { channel, context, guild } = msg

    // * ------------------ Config --------------------

    // get server config
    const db = await serverConfig.findOne({ where: { id: guild.id } })
    const { prefix: p } = JSON.parse(db.dataValues.config)
    const prefix = p || context.prefix

    const { disabledCommands } = client.db.config

    // * ------------------ Logic --------------------

    const checkPerms = (i) => {
      let disabled = false
      disabledCommands.forEach((c) => {
        if (i.name === c.command) disabled = true
      })
      if (disabled) return false

      // if (i.permsNeeded.length) {
      //  if (context.checkPerms(msg.member, i.permsNeeded)) return false
      // }
      // if (i.ownerOnly) {
      //  if (author.id === client.config.ownerID) return true
      //  return false
      // }
      if (i.disabled) return false
      return true
    }

    // filter commands based on author access
    const commands = context.commands.filter((i) => checkPerms(i))
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Filter all commands by which are available for the author's level, using the <Collection>.filter() method.
      const sorted = commands
        .array()
        .sort((i, c) =>
          i.category > c.category ? 1 : i.name > c.name && i.category === c.category ? 1 : -1
        )

      const newSorted = groupBy(sorted, 'category')
      const embedList = []
      Object.keys(newSorted).forEach((key) => {
        const e = Utils.embed(msg)
          .setTitle(`${client.user.username} Help - ${key}`)
          .setThumbnail(client.user.avatarURL)
        newSorted[key].forEach((i) => {
          e.addField(`${prefix}${i.name}`, `${i.description}`, true)
        })
        embedList.push(e)
      })

      return paginate(msg, embedList)
    }
    // Show individual command's help.
    const command = context.findCommand(args[0])

    msg.delete(10000)
    if (command && checkPerms(command)) {
      const m = await channel.send(
        embed(msg)
          .setTitle(`Help - ${capitalize(command.name)}`)
          .setDescription(
            `**${command.description}**\n\`\`\`css\n${command.usage.join('\n')}\n\`\`\`\n${
              command.aliases.length
                ? `Aliases\n\`\`\`css\n${command.aliases.join(', ')}\n\`\`\``
                : ''
            }`
          )
      )
      return m.delete(30000)
    }
  }
}
