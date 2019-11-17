/* eslint-disable class-methods-use-this */
const math = require('math-expression-evaluator')
const Command = require('../../core/Command')

class Calculator extends Command {
  constructor(client) {
    super(client, {
      name: 'calculator',
      category: 'Utils',
      description: 'Calculates maths',
      usage: 'calc 2+2',
      aliases: ['calc']
    })
  }

  async run(client, msg, args) {
    const question = args.join(' ')

    let answer
    try {
      answer = math.eval(question)
    } catch (err) {
      msg.reply('Invalid math equation')
    }

    return msg.channel.send(
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
