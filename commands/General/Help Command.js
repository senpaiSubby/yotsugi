const Command = require('../../core/Command')
const Database = require('../../core/Database')

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
    msg.delete()
    const { Utils } = client
    const { author, channel } = msg

    // get server prefix
    const { id } = msg.guild

    let db = await Database.Models.Config.findOne({ where: { id } })

    if (!db) {
      db = await Database.Models.Config.create({
        id,
        prefix: '?'
      })
    }

    const prefix = db.prefix || this.prefix

    const checkPerms = (i) => {
      if (i.permsNeeded.length) {
        const missingPerms = msg.context.checkPerms(msg.member, i.permsNeeded)
        if (missingPerms) return false
      }
      if (i.ownerOnly) {
        if (author.id === client.config.general.ownerId) {
          return true
        }
        return false
      }
      return true
    }

    // filter commands based on author access
    const commands = msg.context.commands.filter((i) => checkPerms(i))
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Filter all commands by which are available for the author's level, using the <Collection>.filter() method.

      const commandNames = commands.keyArray()
      // console.log(commands)
      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0)

      let currentCategory = ''
      let output = `= Commands =\n\n[Use ${prefix}help <commandname> for details]\n`
      const sorted = commands
        .array()
        .sort((p, c) =>
          p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1
        )

      sorted.map((c) => {
        const cat = c.category
        if (currentCategory !== cat) {
          output += `\u200b\n== ${cat} ==\n`
          currentCategory = cat
        }
        if (!c.disabled) {
          output += `${prefix}${c.name}${' '.repeat(longest - c.name.length)} :: ${c.description}\n`
        }
      })

      const embed = Utils.embed(msg).setDescription(
        'Sent you a message with the commands you have access to.'
      )
      channel.send({ embed }).then((m) => m.delete(10000))
      return author.send(output, { code: 'css', split: { char: '\u200b' } })
    }
    // Show individual command's help.
    const command = msg.context.commands.filter((i) => checkPerms(i) && i.name === args[0])

    if (command) {
      command.forEach((i) => {
        return channel
          .send(
            `= ${i.name} = \n\n${i.description}\n\nusage:\n\n${i.usage.replace(' | ', '\n')}\n\n${
              i.aliases.length ? `aliases: ${i.aliases.join(', ')}` : ''
            }`,
            { code: 'css', split: true }
          )
          .then((m) => m.delete(30000))
      })
    }
  }
}

module.exports = Help
