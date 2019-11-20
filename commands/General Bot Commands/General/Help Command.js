const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: 'Gets Help On Commands',
      aliases: ['halp'],
      guildOnly: true
    })
  }

  async run(client, msg, args) {
    msg.delete(10000)
    const { Utils } = client
    const { author, channel } = msg

    // get server prefix
    const { id } = msg.guild

    const db = await Database.Models.serverConfig.findOne({ where: { id } })

    const prefix = db.prefix || this.prefix

    const checkPerms = (i) => {
      if (i.permsNeeded.length) {
        const missingPerms = msg.context.checkPerms(msg.member, i.permsNeeded)
        if (missingPerms) return false
      }
      if (i.ownerOnly) {
        if (author.id === client.config.ownerID) return true
        return false
      }
      if (i.disabled) return false
      return true
    }

    // filter commands based on author access
    const commands = msg.context.commands.filter((i) => checkPerms(i))
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Filter all commands by which are available for the author's level, using the <Collection>.filter() method.
      const sorted = commands
        .array()
        .sort((p, c) =>
          p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1
        )

      const newSorted = Utils.groupBy(sorted, 'category')
      const e = Utils.embed(msg).setTitle('Commands')
      Object.keys(newSorted).forEach((key) => {
        let cmds = ''
        cmds += `\n\n`
        newSorted[key].forEach((i) => {
          cmds += `**${prefix}${i.name}** | ${i.description}\n`
        })
        e.addField(`${newSorted[key][0].category || '--'}`, cmds)
      })

      const embed = Utils.embed(msg).setDescription(
        'Sent you a message with the commands you have access to.'
      )

      const m = await channel.send({ embed })
      m.delete(10000)

      return author.send(e)
    }
    // Show individual command's help.
    const command = msg.context.commands.filter((i) => checkPerms(i) && i.name === args[0])

    if (command) {
      const m = await channel.send(
        Utils.embed(msg)
          .setTitle(`= ${command.name} =`)
          .setDescription(`**${command.description}**`)
          .addField(
            `**Usage**`,
            `**${command.usage.replace(/ \| /g, '\n')}\n\n${
              command.aliases.length ? `aliases: ${command.aliases.join(', ')}` : ''
            }**`
          )
      )
      return m.delete(30000)
    }
  }
}

module.exports = Help
