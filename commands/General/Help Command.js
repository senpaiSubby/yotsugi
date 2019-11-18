const Command = require('../../core/Command')

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
    const user = msg.author

    const checkPerms = (i) => {
      if (i.permsNeeded.length) {
        const adminList = msg.getAdministrators(msg.guild)

        if (i.permsNeeded && !adminList.includes(msg.author.id)) {
          const missingPerms = []
          for (const perm of i.permsNeeded) {
            if (!msg.member.hasPermission(perm)) {
              missingPerms.push(perm)
            }
          }
          if (missingPerms.length) {
            return false
          }
        }
      }
      if (i.ownerOnly) {
        if (user.id === client.config.general.ownerId) {
          return true
        }
        return false
      }
      return true
    }
    const commands = msg.context.commands.filter((i) => checkPerms(i))
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.

      const commandNames = commands.keyArray()
      // console.log(commands)
      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0)

      let currentCategory = ''
      let output = `= Commands =\n\n[Use ${client.config.general.prefix}help <commandname> for details]\n`
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
          output += `${client.config.general.prefix}${c.name}${' '.repeat(
            longest - c.name.length
          )} :: ${c.description}\n`
        }
      })
      await msg
        .reply({ embed: { title: 'Sent you a message with the commands you have access to.' } })
        .then((m) => m.delete(5000))
      return msg.author.send(output, { code: 'css', split: { char: '\u200b' } })
    }
    // Show individual command's help.
    const command = msg.context.commands.filter((i) => checkPerms(i) && i.name === args[0])

    if (command) {
      command.forEach((i) => {
        return msg.channel
          .send(
            `= ${i.name} = \n\n${i.description}\n\nusage:\n\n${i.usage.replace(' | ', '\n')}\n\n${
              i.aliases.length ? `aliases: ${i.aliases.join(', ')}` : ''
            }`,
            { code: 'css' }
          )
          .then((m) => m.delete(5000))
      })
    }
  }
}

module.exports = Help
