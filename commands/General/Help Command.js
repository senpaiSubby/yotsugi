const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'help',
    category: 'General',
    description: 'List of all my commands',
    usage: `${prefix}help <name>`,
    aliases: ['commands']
  },
  options: {
    enabled: true,
    apiEnabled: true,
    showInHelp: true,
    ownerOnly: false,
    guildOnly: false,
    args: false,
    cooldown: 5
  },
  async execute (client, msg, args, api) {
    const { commands } = msg.client
    //* If no specific command is called, show all filtered commands.
    if (!args[0]) {
      //* Filter all commands by which are available for the user's level, using the <Collection>.filter() method.
      //* const command =
      //*    commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

      //* Here we have to get the command names only, and we use that array to get the longest name.
      //* This make the help commands "aligned" in the output.
      const commandNames = commands.keyArray()
      const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0)

      let currentCategory = ''
      let output = `= Command List =\n\n[Use ${client.config.general.prefix}help <commandname> for details]\n`
      const sorted = commands
        .array()
        .sort((p, c) =>
          p.help.category > c.help.category
            ? 1
            : p.help.name > c.help.name && p.help.category === c.help.category
              ? 1
              : -1
        )
      sorted.map((c) => {
        const cat = c.help.category
        if (currentCategory !== cat && c.options.showInHelp) {
          output += `\u200b\n== ${cat} ==\n`
          currentCategory = cat
        }
        if (c.options.showInHelp) {
          output += `${client.config.general.prefix}${c.help.name}${' '.repeat(
            longest - c.help.name.length
          )} :: ${c.help.description}\n`
        }
      })
      msg.channel.send(output, { code: 'css', split: { char: '\u200b' } })
    } else {
      //* Show individual command's help.
      let command = args[0]
      if (client.commands.has(command)) {
        command = client.commands.get(command)
        //* if (level < client.levelCache[command.conf.permLevel]) return
        msg.channel.send(
          `= ${command.help.name} = \n\n${
            command.help.description
          }\n\nusage:\n\n${command.help.usage.replace(
            ' | ',
            '\n'
          )}\n\naliases: ${command.help.aliases.join(', ')}`,
          { code: 'css' }
        )
      }
    }
  }
}
