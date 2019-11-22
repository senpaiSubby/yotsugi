const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

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
    const { p, Utils } = client
    const { author, channel } = msg

    const todo = args.slice(1).join(' ')

    const memberConfig = await Database.Models.memberConfig.findOne({
      where: { id: author.id }
    })
    const todos = JSON.parse(memberConfig.dataValues.todos)

    switch (args[0]) {
      case 'add': {
        todos.push(todo)
        await memberConfig.update({ todos: JSON.stringify(todos) })
        return msg.reply(Utils.embed(msg, 'green').setDescription(`**${todo}** added to todo list`))
      }
      case 'remove': {
        const item = args[1] - 1
        const name = todos[item]
        todos.splice(item, 1)
        await memberConfig.update({ todos: JSON.stringify(todos) })
        if (name) {
          return msg.reply(
            Utils.embed(msg, 'green').setDescription(`**${name}** removed from todo list`)
          )
        }
        return msg.reply(
          Utils.embed(msg, 'red').setDescription(`:rotating_light: **Rule does not exist**`)
        )
      }
      default: {
        if (!todos.length) {
          return msg.reply(
            Utils.embed(msg, 'yellow')
              .setTitle(`There are no todos!`)
              .setDescription(`\`${p}todos add <todo to add>\`\nTo add some!`)
          )
        }

        let todoList = ''
        todos.forEach((i, index) => {
          todoList += `${index + 1} | ${i}\n`
        })
        return msg.reply(
          Utils.embed(msg, 'green')
            .setTitle('Todos')
            .setDescription(todoList)
        )
      }
    }
  }
}

module.exports = Todo
