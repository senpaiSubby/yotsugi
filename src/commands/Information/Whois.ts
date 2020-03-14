/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { BotClient } from 'core/BotClient'
import { NezukoMessage } from 'typings'
import whoiser from 'whoiser'
import { Command } from '../../core/base/Command'
import { Utils } from '../../core/Utils'

/*!
 * Coded by nwithan8 - https://github.com/nwithan8
 * TODO: Some witty tagline
 */

/**
 * Command to get whois information on a domain
 */
export default class Whois extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Information',
      description: 'Get WHOIS information on a domain',
      name: 'whois',
      usage: ['whois [domain]']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { errorMessage, embed } = Utils

    const { channel } = msg

    const domain = args[0]

    try {
      const results = await whoiser(domain)
      const key = Object.keys(results)[0]
      const registrarServer = results[key]['Registrar WHOIS Server']
      const registrarName = results[key].Registrar
      const updatedTime = new Date(results[key]['Updated Date']).toString()
      const createdTime = new Date(results[key]['Created Date']).toString()
      const expiryTime = new Date(results[key]['Expiry Date']).toString()

      return channel.send(
        embed(msg, 'blue')
          .setTitle(`Whois [ ${domain} ]`)
          .addField('Registrar Server', registrarServer, true)
          .addField('Registrar Name', registrarName, true)
          .addField('Created', createdTime)
          .addField('Updated Time', updatedTime)
          .addField('Expiry Time', expiryTime)
      )
    } catch {
      // Tld not found
      return errorMessage(msg, `Looks like [ ${domain} ] ins't a valid tld`)
    }
  }
}
