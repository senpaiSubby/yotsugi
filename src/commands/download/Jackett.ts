/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage } from 'typings'
import { get } from 'unirest'
import urljoin from 'url-join'
import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Jackett extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'jackett',
      category: 'Download',
      description: 'Search for torrents via Jackett',
      usage: ['find <torrent to look for>'],
      aliases: ['find'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { Utils, Log, db, p } = client
    const { bytesToSize, sortByKey, embed, paginate, errorMessage, warningMessage, missingConfig } = Utils

    // * ------------------ Config --------------------

    const { host, apiKey } = db.config!.jackett

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [`${p}config set jackett host <http://ip>`, `${p}config set jackett apiKey <APIKEY>`]
      return missingConfig(msg, 'jackett', settings)
    }

    // * ------------------ Logic --------------------
    const fetchResults = async (term: string) => {
      try {
        const response = await get(
          urljoin(host, `/api/v2.0/indexers/all/results?apikey=${apiKey}&Query=${term}`)
        ).headers({ accept: 'application/json' })

        const { Results } = response.body as JackettAPISearch

        if (Results.length) {
          const filteredResults: any[] = []
          Results.forEach((i) => {
            const { Tracker, Title, Guid, Size, Seeders, Peers } = i

            filteredResults.push({
              name: Title,
              tracker: Tracker,
              link: Guid,
              size: bytesToSize(Size),
              seeders: Seeders,
              peers: Peers
            })
          })
          return sortByKey(filteredResults, 'seeders')
        }
        await warningMessage(msg, `No results for [ ${term} ]`)
      } catch (e) {
        const text = 'Could not connect to Jackett'
        Log.error('Jackett', text, e)
        await errorMessage(msg, text)
      }
    }

    // * ------------------ Usage Logic --------------------
    const results = await fetchResults(args.join(' '))

    if (results) {
      const embedList: any[] = []

      results.forEach((i) => {
        const { name, tracker, size, seeders, peers } = i
        embedList.push(
          embed('green', 'torrent.png')
            .setTitle(`Torrent Results [ ${args.join(' ')} ]`)
            .addField('Name', `${name}`, false)
            .addField('Tracker', tracker, true)
            .addField('Size', size, true)
            .addField('Seeder | Peers', `${seeders} | ${peers}`, true)
        )
      })

      const choice = await paginate(msg, embedList, true)

      if (choice || choice === 0) return msg.reply(results[0].link)
    }
  }
}
