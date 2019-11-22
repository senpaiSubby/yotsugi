const math = require('math-expression-evaluator')
const Command = require('../../../core/Command')

class Calculator extends Command {
  constructor(client) {
    super(client, {
      name: 'calc',
      category: 'Utils',
      description: 'Calculates maths',
      usage: 'calc 2+2',
      aliases: ['calculator']
    })
  }

  async run(client, msg, args) {
    const { channel } = msg

    const question = args.join(' ')

    let answer
    try {
      answer = math.eval(question)
    } catch (err) {
      msg.reply('Invalid math equation')
    }

    return channel.send(
      '**Equation:**\n' +
        '```css\n' +
        `${question}\n` +
        '```\n' +
        '**Answer:**\n' +
        '```css\n' +
        `${answer}\n` +
        '```'
    )
  }
}
module.exports = Calculator
