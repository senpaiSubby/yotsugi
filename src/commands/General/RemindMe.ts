/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import ms from 'ms'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class RemindMe extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'remindme',
      category: 'General',
      description: 'Set some reminders',
      usage: ['remindme 10s do the dishes', 'remindme 1h make memes', 'remindme 1m get funky with it'],
      aliases: ['remind']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { Utils } = client
    const { standardMessage, embed } = Utils
    const { author } = msg

    const timer = args[0]
    const notice = args.splice(1, 1000).join(' ')

    await standardMessage(
      msg,
      'green',
      `**:white_check_mark:  I'll DM you in [ ${ms(ms(timer), {
        long: true
      })} ] to [ ${notice} ]**`
    )

    setTimeout(
      async () =>
        await author.send(
          embed(msg, 'green').setDescription(
            `**It's been [ ${ms(ms(timer), {
              long: true
            })} ] Here's your reminder to [ ${notice} ]**`
          )
        ),
      ms(timer)
    )
  }
}
