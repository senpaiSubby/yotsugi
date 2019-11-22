const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      category: 'General',
      description: 'Gets Help On Commands',
      aliases: ['halp'],
      guildOnly: true
    })
  }

  async run(client, msg, args) {
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
      msg.delete(10000)
      // Filter all commands by which are available for the author's level, using the <Collection>.filter() method.
      const sorted = commands
        .array()
        .sort((p, c) =>
          p.category > c.category ? 1 : p.name > c.name && p.category === c.category ? 1 : -1
        )

      const newSorted = Utils.groupBy(sorted, 'category')
      const embedList = []
      Object.keys(newSorted).forEach((key) => {
        const e = Utils.embed(msg, 'green', true)
          .setTitle(`SubbyBot Help - ${key} Commands`)
          .setThumbnail(client.user.avatarURL)
        newSorted[key].forEach((i) => {
          e.addField(`${prefix}${i.name}`, `${i.description}`, true)
        })
        embedList.push(e)
      })

      const totalPages = embedList.length

      // start page at 0
      let page = 0
      let run = true
      // run our loop to wait for user input
      const editMessage = await msg.channel.send('|')
      while (run) {
        await editMessage.edit(
          embedList[page].setDescription(`:blue_book: **Page ${page + 1}/${totalPages}**`)
        )

        if (totalPages.length !== 1) {
          if (page === 0) {
            await editMessage.react('➡️')
          } else if (page + 1 === totalPages.length) {
            await editMessage.react('⬅️')
          } else {
            await editMessage.react('⬅️')
            await editMessage.react('➡️')
          }
        }

        const collected = await editMessage.awaitReactions(
          (reaction, user) =>
            ['⬅️', '➡️'].includes(reaction.emoji.name) &&
            user.id === author.id &&
            user.id !== client.user.id,
          { max: 1, time: 60000 }
        )
        const reaction = collected.first()
        if (reaction) {
          await editMessage.clearReactions()

          switch (reaction.emoji.name) {
            case '⬅️':
              page--
              break
            case '➡️':
              page++
              break
            default:
              break
          }
        } else {
          run = false
          return
        }
        await editMessage.clearReactions()
      }
    }
    // Show individual command's help.
    const command = msg.context.findCommand(args[0])

    msg.delete(10000)
    if (command && checkPerms(command)) {
      const m = await channel.send(
        Utils.embed(msg, 'green')
          .setTitle(`Help - ${Utils.capitalize(command.name)}`)
          .setDescription(
            `**${command.description}**\n\`\`\`css\n${command.usage.replace(
              / \| /g,
              '\n'
            )}\n\`\`\`\n${
              command.aliases.length
                ? `Aliases\n\`\`\`css\n${command.aliases.join(', ')}\n\`\`\``
                : ''
            }`
          )
      )
      return m.delete(30000)
    }
  }
}

module.exports = Help
