const Command = require('../../core/Command')
const { Manager } = require('../../index')
const config = require('../../data/config.js')
const { RichEmbed } = require('discord.js')

class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'Help',
      description: 'Gets Help On Commands',
      aliases: ['halp']
    })
  }

  async run(msg, args, api) {
    const channel = msg.channel
    const user = msg.author
    let commands = msg.context.commands
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.
      // const command =
      //    commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

      // Here we have to get the command names only, and we use that array to get the longest name.
      // This make the help commands "aligned" in the output.
      const commandNames = commands.keyArray()
      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0)

      let currentCategory = ''
      let output = `= Command List =\n\n[Use ${this.client.config.general.prefix}help <commandname> for details]\n`
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
      msg.channel.send(output, { code: 'css', split: { char: '\u200b' } })
    } else {
      // Show individual command's help.
      let command = args[0]
      if (this.client.commands.has(command)) {
        command = this.client.commands.get(command)
        // if (level < this.client.levelCache[command.conf.permLevel]) return
        msg.channel.send(
          `= ${command.name} = \n\n${command.description}\n\nusage:\n\n${command.usage.replace(
            ' | ',
            '\n'
          )}\n\naliases: ${command.aliases.join(', ')}`,
          { code: 'css' }
        )
      }
    }
  }
}

module.exports = Help
