/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { BotClient } from 'core/BotClient'
import { NezukoMessage } from 'typings'
import whois from 'whois-2'

import { Command } from '../../core/base/Command'

/*!
 * Coded by nwithan8 - https://github.com/nwithan8
 * TODO: Some witty tagline
 */

export default class Whois extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'whois',
      category: 'Information',
      description: 'Get WHOIS information on a domain',
      usage: ['whois <domain to search for>'],
      args: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { Utils } = client
    const { errorMessage, embed } = Utils

    const { channel } = msg

    const domain = args.join(' ')
    const results = await whois(domain, { format: 'json' }) // Not sure if needs to be awaited

    if (results && results.domain_name) {
      return channel.send(
        embed(msg)
          .setTitle('WHOIS Info')
          .addField('Domain', results.domain_name)
          .addField('Created', results.creation_date)
          .addField('Updated', results.updated_date)
          .addField('Expires', results.registry_expiry_date)
      )
    }
    return errorMessage(msg, 'Sorry, not sorry bro. That domain doesn\'t exist.')
  }
}
