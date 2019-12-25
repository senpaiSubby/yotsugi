import { Command } from '../../core/Command'

export default  class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      category: 'Information',
      description: 'Get command help',
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
        const e = Utils.embed('green')
          .setTitle(`${client.user.username} Help - [ ${key} ]`)
          .setThumbnail(client.user.avatarURL)
          .setDescription(`**\`${prefix}help [ command ]\` for command usage**`)
        newSorted[key].forEach((i) => {
          let aliases = ''
          if (i.aliases.length) {
            if (i.aliases.length > 1) {
              aliases += `| ${i.aliases.join(' | ')}`
            } else {
              aliases += `| ${i.aliases}`
            }
          }
          e.addField(`**${i.name} ${aliases}**`, `${i.description}`, true)
        })
        embedList.push(e)
      })

      return paginate(msg, embedList)
    }
    // Show individual command's help.
    const command = context.findCommand(args[0])

    if (command && checkPerms(command)) {
      return channel.send(
        embed('green')
          .setTitle(`Help - ${capitalize(command.name)}`)
          .setDescription(
            `**${command.description}**\n\`\`\`css\n${command.usage.join('\n')}\n\`\`\`\n${
              command.aliases.length
                ? `Aliases\n\`\`\`css\n${command.aliases.join(', ')}\n\`\`\``
                : ''
            }`
          )
      )
    }
  }
}
