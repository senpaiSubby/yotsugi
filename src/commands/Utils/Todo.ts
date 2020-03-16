/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import { MemberDBConfig, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

/**
 * Command to manage your to-do items
 */
export default class Todo extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Utils',
      description: 'Your personal todo list',
      name: 'todo',
      usage: ['todo add [what you want to do later]', 'todo list'],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { p } = client
    const { standardMessage, embed, asyncForEach, warningMessage, validOptions } = Utils
    const { author, channel } = msg

    const todo = args.slice(1).join(' ')

    const db = await database.models.Members.findOne({ where: { id: author.id } })

    const config = JSON.parse(db.get('config') as string) as MemberDBConfig

    const { todos } = config

    switch (args[0]) {
      case 'add': {
        if (todos.length >= 10) {
          return warningMessage(msg, 'You cannot have more than [ 10 ] todos!')
        }

        if (!todo) {
          const m = await warningMessage(msg, 'Todo cannot be empty!')
          return m.delete({ timeout: 3000 })
        }

        todos.push(todo.trim())
        await db.update({ config: JSON.stringify(config) })
        return standardMessage(msg, 'green', `Added [ ${todo} ] to todo list`)
      }

      case 'list': {
        if (!todos.length) {
          return channel.send(
            embed(msg, 'yellow')
              .setTitle('Todo list is empty!')
              .setDescription(`\`${p}todos add <todo to add>\` to add one`)
          )
        }

        const reactions = [
          '\u0031\u20E3',
          '\u0032\u20E3',
          '\u0033\u20E3',
          '\u0034\u20E3',
          '\u0035\u20E3',
          '\u0036\u20E3',
          '\u0037\u20E3',
          '\u0038\u20E3',
          '\u0039\u20E3',
          '🔟'
        ]
        // Setup initial embed
        const e = embed(msg, 'green', 'todo.png').setTitle('Todo List')
        todos.forEach((i, index) => e.addField(`[ ${index + 1} ]`, `${i}`, true))
        const m = await channel.send(e)

        await asyncForEach(todos, async (i, index) => {
          await m.react(reactions[index])
        })
        await m.react('🛑')

        // Setup reaction collector
        const filter = (reaction, user) => {
          const { name } = reaction.emoji
          if (reactions.includes(name) && user.id === author.id) return true
          if (name === '🛑' && user.id === author.id) return true
        }
        const collector = m.createReactionCollector(filter, {
          max: 11,
          time: 3600000
        })

        collector.on('collect', async (a) => {
          if (a.emoji.name === '🛑') return m.reactions.removeAll()

          // Find index
          const index = reactions.findIndex((i) => i === a.emoji.name)

          // Remove and notify todo is removed
          const name = todos[index]
          todos.splice(index, 1)
          await db.update({ config: JSON.stringify(config) })
          const removeMessage = await standardMessage(msg, 'green', `[ ${name} ] removed from todo list`)
          removeMessage.delete({ timeout: 2000 })

          // Edit original embed with updated content
          await m.reactions.removeAll()
          if (!todos.length) {
            return m.edit(
              embed(msg, 'yellow')
                .setTitle('There are no more todos!')
                .setDescription(`\`${p}todos add <todo to add>\` to add one`)
            )
          }
          const newEmbed = embed(msg, 'green').setTitle('Todo List')
          todos.forEach((i, ind) => newEmbed.addField(`[ ${ind + 1} ]`, `${i}`, true))
          await m.edit(newEmbed)
          await asyncForEach(todos, async (i, ind) => {
            await m.react(reactions[ind])
          })
          await m.react('🛑')
        })
        break
      }
      default:
        return validOptions(msg, ['add', 'list'])
    }
  }
}
