import { Message, Channel } from 'discord.js'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { NeukoClient } from '../../core/NezukoClient'
import whois from 'whois-2'
import twitter from 'twitter'

export default class Whois extends Command {
    constructor(client: NezukoClient) {
        super(client, {
            name: 'whois',
            category: 'Networking',
            description: 'Get WHOIS information on a domain',
            usage: ['whois <domain to search for>'],
            args: true
        })
    }

    public async domain_search(domain) {
        return await whois(domain, {format: 'json'}) //not sure if needs to be awaited
    }

    public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
        const { Utils, Log } = client
        const { errorMessage, embed } = Utils

        const { channel } = msg

        const keyword = args.join(' ')

        var domain_available = false
        var domain_expiration = null
        var available_alt_domains = []
        var available_alt_domains_list = null
        var twitter_available = false
        
        /** Check if domain of keyword exists */

        var results = await this.domain_search(keyword.concat('.com'))
        console.log(results)
        if (results.domain_name) {
            domain_available = false
            domain_expiration = results.registry_expiry_date
            for (const alt of ['net', 'org', 'tech', 'io', 'biz', 'edu', 'co', 'app', 'me', 'dev', 'site', 'online', 'us']) {
                results = await this.domain_search(keyword.concat('.',alt))
                if (!results.domain_name) {
                    //available_alt_domains.push(keyword.concat('.',alt))
                    available_alt_domains_list.concat(keyword.concat('.',alt,', '))
                }
            }
        } else {
            domain_available = true
        }

        /** Check if Twitter handle is available */

        const tw = new twitter({
            consumer_key: 'xxxx',
            consumer_secret: 'xxxx',
            access_token_key: 'xxxx',
            access_token_secret: 'xxxx'
          });

        tw.get('users/lookup', {screen_name: keyword}, function(error, data, response) {
            if (!error) {
                twitter_available = false
            } else {
                twitter_available = true
            }
        });

        return channel.send(
            embed()
                .addTitle('Brand Availability')
                .addField(keyword.concat('.com'), domain_available == true ? 'Available' : 'Unavailable (Expires '.concat(domain_expiration))
                .addField(domain_available == false ? 'Alternate domains' : ' ', domain_available == false ? available_alt_domains_list : ' ')
                .addField('@'.concat(keyword, ' on Twitter'), twitter_available == false ? 'Unavailable' : 'Available')
        )
    }
}