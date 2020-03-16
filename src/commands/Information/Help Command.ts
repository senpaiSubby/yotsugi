/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

/**
 * Command to get information on what other commands are available and how to use them
 */
export default class Help extends Command {
  constructor(client: BotClient) {
    super(client, {
      category: 'Information',
      description: 'Get help on command usage',
      guildOnly: true,
      name: 'help',
      usage: ['help', 'help [some command]']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { embed, groupBy, paginate, capitalize, checkPerms } = Utils
    const { channel, context, guild, author } = msg

    // Fetch server config from database
    const serverDB = await database.models.Servers.findOne({ where: { id: guild.id } })
    const { prefix: p } = JSON.parse(serverDB.get('config') as string) as ServerDBConfig
    const prefix = p || context.prefix

    // Fetch config from database
    const configDB = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const { disabledCommands } = JSON.parse(configDB.get('config') as string) as GeneralDBConfig

    /**
     * Checks if a user has the permission for the specified command
     * @param i command
     */
    const checkUserPerms = (i: Command) => {
      // Check if command is disabled
      for (const c of disabledCommands) {
        if (i.name === c.command) return false
      }

      // Check if user has perms needed for command
      if (i.permsNeeded.length && checkPerms(msg.member, i.permsNeeded).length) {
        return false
      }

      // Check if command is owner only
      if (i.ownerOnly) return author.id === client.config.ownerID

      // Return if command is disabled
      return !i.disabled
    }

    // Filter commands based on author access
    const commands = context.commands.filter((i: Command) => checkUserPerms(i))

    // If no specific command is called, show all filtered commands.

    const specifiedCommandForHelp = args[0]

    // Show individual command's help.

    if (specifiedCommandForHelp) {
      // Find command in bot
      const command = context.findCommand(specifiedCommandForHelp)

      // If command exists and user has perms for it
      if (command && checkUserPerms(command)) {
        const e = embed(msg, 'green')
          .setTitle(`Help - ${capitalize(command.name)}`)
          .setThumbnail(client.user.avatarURL())
          .setDescription(`**${command.description}**`)
          .addField('Usage', `**${command.usage.join('\n')}**`)

        if (command.aliases.length) e.addField('Aliases', `**${command.aliases.join('\n')}**`)

        // Return command info
        return channel.send(e)
      }
    }

    const sorted = commands
      .array()
      .sort((i: Command, c: Command) =>
        i.category > c.category ? 1 : i.name > c.name && i.category === c.category ? 1 : -1
      )

    // Split commands into category groups
    const splitByCategory = groupBy(sorted, 'category')

    // Generate embed list
    const embedList = Object.keys(splitByCategory).map((key) => {
      const e = Utils.embed(msg, 'green')
        .setTitle(`Help - [ ${key} ]`)
        .setThumbnail(client.user.avatarURL())
        .setDescription(
          `**Showing commands that you have access to**\n**\`${prefix}help [ command ]\` for command usage**`
        )

      let description = ''

      // Add command name and description to description variable
      splitByCategory[key].forEach((i: Command) => {
        description += `**${i.name}**\n> **${i.description}**\n`
      })

      // Add description to embed
      e.addField('Commands', description)

      // Return embed
      return e
    })

    // Return help embed
    return paginate(msg, embedList)
  }
}
