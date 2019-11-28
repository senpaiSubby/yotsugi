const Command = require('../../core/Command')

module.exports = class Todo extends Command {
  constructor(client) {
    super(client, {
      name: 'todos',
      aliases: ['todo'],
      category: 'Utils',
      description: 'Your personal todo list'
    })
  }

  async run(client, msg, args) {
    const { p, Utils, memberConfig } = client
    const { warningMessage, standardMessage, embed } = Utils
    const { author } = msg

    const todo = args.slice(1).join(' ')

    const db = await memberConfig.findOne({ where: { id: author.id } })
    const config = JSON.parse(db.dataValues.config)
    const { todos } = config

    switch (args[0]) {
      case 'add': {
        todos.push(todo)
        await db.update({ config: JSON.stringify(config) })

        return standardMessage(msg, `[ ${todo} ]\n\nAdded to todo list`)
      }

      case 'remove': {
        const item = args[1] - 1
        const name = todos[item]
        todos.splice(item, 1)
        await db.update({ config: JSON.stringify(config) })

        if (name) return standardMessage(msg, `[ ${name} ]\n\nRemoved from todo list`)

        return warningMessage(msg, `Todo [ ${name} ] does not exist`)
      }

      default: {
        if (!todos.length) {
          return msg.reply(
            embed(msg, 'yellow')
              .setTitle(`There are no todos!`)
              .setDescription(`\`${p}todos add <todo to add>\`\nTo add some!`)
          )
        }

        let todoList = ''
        todos.forEach((i, index) => (todoList += `${index + 1} | ${i}\n`))

        return msg.reply(
          embed(msg)
            .setTitle('Todos')
            .setDescription(todoList)
        )
      }
    }
  }
}
