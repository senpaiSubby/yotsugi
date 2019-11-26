const Command = require('../../core/Command')

class Todo extends Command {
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

    const config = await memberConfig.findOne({
      where: { id: author.id }
    })

    const todos = JSON.parse(config.dataValues.todos)

    switch (args[0]) {
      case 'add': {
        todos.push(todo)
        await config.update({ todos: JSON.stringify(todos) })

        return standardMessage(msg, `${todo}\n\nAdded to todo list`)
      }

      case 'remove': {
        const item = args[1] - 1
        const name = todos[item]
        todos.splice(item, 1)
        await config.update({ todos: JSON.stringify(todos) })

        if (name) return standardMessage(msg, `${name}\n\nRemoved from todo list`)

        return warningMessage(msg, `Rule does not exist`)
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
        todos.forEach((i, index) => {
          todoList += `${index + 1} | ${i}\n`
        })

        return msg.reply(
          embed(msg)
            .setTitle('Todos')
            .setDescription(todoList)
        )
      }
    }
  }
}

module.exports = Todo
