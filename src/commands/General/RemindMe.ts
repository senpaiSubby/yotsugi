/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import ms from 'ms'

export default class RemindMe extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'remindme',
      category: 'General',
      description: 'Set some reminders',
      usage: [
        'remindme 10s do the dishes',
        'remindme 1h make memes',
        'remindme 1m get funky with it'
      ]
    })
  }

  /**
   * Run this command
   * @param client Nezuko client
   * @param msg Original message
   * @param args Optional arguments
   */
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    const { Utils } = client
    const { standardMessage, embed } = Utils
    const { author } = msg

    msg.delete(10000)

    const timer = Number(args[0])
    const notice = args.splice(1, 1000).join(' ')

    const m = (await standardMessage(
      msg,
      `**:white_check_mark:  I'll DM you in [ ${ms(timer)}, {
        long: true
      })} ] to [ ${notice} ]**`
    )) as NezukoMessage

    m.delete(10000)

    setTimeout(
      () =>
        author.send(
          embed('green', 'hourglass.png').setDescription(
            `**It's been [ ${ms(timer)}, {
              long: true
            })} ] Here's your reminder to [ ${notice} ]**`
          )
        ),
      ms(timer)
    )
  }
}
