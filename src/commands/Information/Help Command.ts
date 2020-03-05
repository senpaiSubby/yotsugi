/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Memoize } from 'typescript-memoize'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Help extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'help',
      category: 'Information',
      description: 'Get command help',
      guildOnly: true,
      usage: ['help', 'help <some command>']
    })
  }

  @Memoize()
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, serverConfig } = client
    const { embed, groupBy, paginate, capitalize, checkPerms, addSpace } = Utils
    const { channel, context, guild, author } = msg

    // * ------------------ Config --------------------

    // Get server config
    const db = await serverConfig.findOne({ where: { id: guild.id } })
    const { prefix: p } = JSON.parse(db.dataValues.config)
    const prefix = p || context.prefix

    const { disabledCommands } = client.db.config

    // * ------------------ Logic --------------------

    const checkUserPerms = (i: Command) => {
      let disabled = false
      disabledCommands.forEach((c) => {
        if (i.name === c.command) disabled = true
      })
      if (disabled) return false

      if (i.permsNeeded.length && checkPerms(msg.member, i.permsNeeded).length)
        return false

      if (i.ownerOnly) {
        if (author.id === client.config.ownerID) return true
        return false
      }
      if (i.disabled) return false
      return true
    }

    // Filter commands based on author access
    const commands = context.commands.filter((i: Command) => checkUserPerms(i))
    // If no specific command is called, show all filtered commands.
    if (!args[0]) {
      const sorted = commands
        .array()
        .sort((i: Command, c: Command) =>
          i.category > c.category
            ? 1
            : i.name > c.name && i.category === c.category
            ? 1
            : -1
        )

      const newSorted = groupBy(sorted, 'category')
      const embedList = []

      Object.keys(newSorted).forEach((key) => {
        const e = Utils.embed(msg, 'green')
          .setTitle(`${client.user.username} Help - [ ${key} ]`)
          .setThumbnail(client.user.avatarURL)
        /**
         .setDescription(
         `**Showing commands that you have access to**\n**\`${prefix}help [ command ]\` for command usage**`
         )
         */

        let desc = `-\n** Help [ ${key} ]**\n\`Showing commands you have access to\`\n**\`${prefix}help [ command ]\` for command usage**\n\`\`\`css\n`
        let longestString = 0

        newSorted[key].forEach((s) => {
          if (s.name.length > longestString) longestString = s.name.length
        })

        newSorted[key].forEach((i: Command) => {
          if (i.name.length === longestString) {
            desc += `${i.name} - ${i.description}\n`
          } else {
            desc += `${i.name}${addSpace(longestString - i.name.length)} - ${
              i.description
            }\n`
          }
        })

        desc = `${desc}\n\`\`\``
        embedList.push(desc)
      })

      return paginate(msg, embedList)
    }

    // Show individual command's help.
    const command = context.findCommand(args[0])

    if (command && checkUserPerms(command)) {
      return channel.send(
        embed(msg, 'green')
          .setTitle(`Help - ${capitalize(command.name)}`)
          .setDescription(
            `**${command.description}**\n\`\`\`css\n${command.usage.join(
              '\n'
            )}\n\`\`\`\n${
              command.aliases.length
                ? `Aliases\n\`\`\`css\n${command.aliases.join(', ')}\n\`\`\``
                : ''
            }`
          )
      )
    }
  }
}
