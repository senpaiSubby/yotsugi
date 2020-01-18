/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoClient } from 'core/NezukoClient'
import twitter from 'twitter'
import { NezukoMessage } from 'typings'
import whois from 'whois-2'

import { Command } from '../../core/base/Command'

/*!
 * Coded by nwithan8 - https://github.com/nwithan8
 * TODO: Some witty tagline
 */

interface WhoisLookup {
  domain_name: string
  registry_domain_id: string
  registrar_whois_server: 'whois.enom.com'
  registrar_url: string
  updated_date: string
  creation_date: string
  registry_expiry_date: string
  registrar: string
  registrar_iana_id: string
  domain_status: string
  name_server: string[]
  dnssec: string
  url_of_the_icann_whois_inaccuracy_complaint_form: string
}

export default class Whois extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'brandfinder',
      category: 'Information',
      description: 'See if a website and Twitter account is available for a new brand',
      usage: ['brandfinder <brand name>'],
      args: true
    })
  }

  public async domain_search(domain: string) {
    return whois(domain, { format: 'json' })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    const { Utils } = client
    const { embed } = Utils
    const { channel } = msg

    const keyword = args.join(' ')

    let domainAvailable: boolean = false
    let domainExpiration: string | null = null
    const availableAltDomains: any[] = []
    let availableAltDomainsList: string = null
    let twitterAvailable: boolean = false

    /** Check if domain of keyword exists */

    let results = (await this.domain_search(`${keyword}.com`)) as WhoisLookup

    if (results && results.domain_name) {
      domainAvailable = false
      domainExpiration = results.registry_expiry_date
      for (const alt of ['net', 'org', 'tech', 'io', 'biz', 'edu', 'co', 'app', 'me', 'dev', 'site', 'online', 'us']) {
        results = await this.domain_search(`${keyword}.${alt}`)
        if (!results.domain_name) availableAltDomainsList = `${keyword}.${alt}`
      }
    } else domainAvailable = true

    /** Check if Twitter handle is available */

    const tw = new twitter({
      consumer_key: 'xxxx',
      consumer_secret: 'xxxx',
      access_token_key: 'xxxx',
      access_token_secret: 'xxxx'
    })

    tw.get('users/lookup', { screen_name: keyword }, (error, data, response) => {
      if (!error) twitterAvailable = false
      else twitterAvailable = true
    })

    return channel.send(
      embed(msg)
        .setTitle('Brand Availability')
        .addField(`${keyword}.com`, domainAvailable ? 'Available' : `Unavailable (Expires ${domainExpiration})`)
        .addField(!domainAvailable ? 'Alternate domains' : ' ', !domainAvailable ? availableAltDomainsList : ' ')
        .addField(`@${keyword} on Twitter`, !twitterAvailable ? 'Unavailable' : 'Available')
    )
  }
}
