/*!
* Coded by nwithan8 - https://github.com/nwithan8
* TODO: Some witty tagline
*/

import { Message, Channel } from 'discord.js'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { NeukoClient } from '../../core/NezukoClient'
import whois from 'whois-2'

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

    public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
        const { Utils, Log } = client
        const { errorMessage, embed } = Utils

        const { channel } = msg
        
        const domain = args.join(' ')
        const results = await whois(domain, { format: 'json'}) //not sure if needs to be awaited
        console.log(results)

        if (results.domain_name) {
            return channel.send(
                embed()
                    .addTitle('WHOIS Info')
                    .addField('Domain', results.domain_name)
                    .addField('Created', results.creation_date)
                    .addField('Updated', results.updated_date)
                    .addField('Expires', results.registry_expiry_date)
            )
        }
        return errorMessage(msg, 'Sorry, not sorry bro. That domain doesn\'t exist.')
    }
}