/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import ms from 'ms'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class RemindMe extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'remindme',
      category: 'General Commands',
      description: 'Set some reminders',
      usage: ['remindme 10s do the dishes', 'remindme 1h make memes', 'remindme 1m get funky with it'],
      aliases: ['remind']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    const { Utils } = client
    const { standardMessage, embed } = Utils
    const { author } = msg

    msg.delete(10000)

    const timer = args[0]
    const notice = args.splice(1, 1000).join(' ')

    const m = (await standardMessage(
      msg,
      'green',
      `**:white_check_mark:  I'll DM you in [ ${ms(ms(timer), {
        long: true
      })} ] to [ ${notice} ]**`
    )) as Message

    m.delete(10000)

    setTimeout(
      () =>
        author.send(
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
