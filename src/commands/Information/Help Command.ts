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
    // * ------------------ Setup --------------------

    const { embed, groupBy, paginate, capitalize, checkPerms } = Utils
    const { channel, context, guild, author } = msg

    // * ------------------ Config --------------------

    // Get server config
    const serverDB = await database.models.Servers.findOne({ where: { id: guild.id } })
    const { prefix: p } = JSON.parse(serverDB.get('config') as string) as ServerDBConfig
    const prefix = p || context.prefix

    const configDB = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const { disabledCommands } = JSON.parse(configDB.get('config') as string) as GeneralDBConfig

    // * ------------------ Logic --------------------

    const checkUserPerms = (i: Command) => {
      let disabled = false
      disabledCommands.forEach((c) => {
        if (i.name === c.command) disabled = true
      })
      if (disabled) return false

      if (i.permsNeeded.length && checkPerms(msg.member, i.permsNeeded).length) {
        return false
      }

      if (i.ownerOnly) {
        return author.id === client.config.ownerID
      }
      return !i.disabled
    }

    // Filter commands based on author access
    const commands = context.commands.filter((i: Command) => checkUserPerms(i))
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      const sorted = commands
        .array()
        .sort((i: Command, c: Command) =>
          i.category > c.category ? 1 : i.name > c.name && i.category === c.category ? 1 : -1
        )

      const newSorted = groupBy(sorted, 'category')
      const embedList = []

      Object.keys(newSorted).forEach((key) => {
        const e = Utils.embed(msg, 'green')
          .setTitle(`Help - [ ${key} ]`)
          .setThumbnail(client.user.avatarURL)
          .setDescription(
            `**Showing commands that you have access to**\n**\`${prefix}help [ command ]\` for command usage**`
          )

        let description = ''
        newSorted[key].forEach((i: Command) => {
          description += `**${i.name}**\n> **${i.description}**\n`
        })
        e.addField('Commands', description)
        embedList.push(e)
      })

      return paginate(msg, embedList)
    }

    // Show individual command's help.
    const command = context.findCommand(args[0])

    if (command && checkUserPerms(command)) {
      const e = embed(msg, 'green')
        .setTitle(`Help - ${capitalize(command.name)}`)
        .setThumbnail(client.user.avatarURL)
        .setDescription(`**${command.description}**`)
        .addField('Usage', `**${command.usage.join('\n')}**`)

      if (command.aliases) e.addField('Aliases', `**${command.aliases.join('\n')}**`)

      return channel.send(e)
    }
  }
}
