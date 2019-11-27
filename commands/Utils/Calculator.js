const math = require('math-expression-evaluator')
const Command = require('../../core/Command')

module.exports = class Calculator extends Command {
  constructor(client) {
    super(client, {
      name: 'calc',
      category: 'Utils',
      description: 'Calculates maths',
      usage: ['calc 2+2'],
      aliases: ['calculator']
    })
  }

  async run(client, msg, args) {
    const { channel } = msg
    const { warningMessage } = client.Utils

    const question = args.join(' ')

    let answer
    try {
      answer = math.eval(question)
    } catch (err) {
      return warningMessage(`Invalid math equation`)
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
