const Command = require('../../core/Command')

class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'Help',
      description: 'Gets Help On Commands',
      aliases: ['halp'],
      guildOnly: true
    })
  }

  async run(msg, args, api) {
    const user = msg.author

    const checkPerms = (i) => {
      if (i.adminOnly) {
        const admins = msg.getAdministrators(msg.guild)
        if (admins.includes(user.id)) {
          return true
        } else {
          return false
        }
      } else if (i.ownerOnly) {
        if (user.id === this.client.config.general.ownerId) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    }
    let commands = msg.context.commands.filter((i) => checkPerms(i))
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.

      const commandNames = commands.keyArray()
      //console.log(commands)
      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0)

      let currentCategory = ''
      let output = `= Commands =\n\n[Use ${this.client.config.general.prefix}help <commandname> for details]\n`
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
          output += `${this.client.config.general.prefix}${c.name}${' '.repeat(
            longest - c.name.length
          )} :: ${c.description}\n`
        }
      })
      msg
        .reply({ embed: { title: 'Sent you a message with the commands you have access to.' } })
        .then((msg) => msg.delete(5000))
      msg.author.send(output, { code: 'css', split: { char: '\u200b' } })
    } else {
      // Show individual command's help.
      let command = args[0]
      if (this.client.commands.has(command)) {
        command = this.client.commands.get(command)
        // if (level < this.client.levelCache[command.conf.permLevel]) return
        msg.channel
          .send(
            `= ${command.name} = \n\n${command.description}\n\nusage:\n\n${command.usage.replace(
              ' | ',
              '\n'
            )}\n\naliases: ${command.aliases.join(', ')}`,
            { code: 'css' }
          )
          .then((msg) => msg.delete(5000))
      }
    }
  }
}

module.exports = Help
