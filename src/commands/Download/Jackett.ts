/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import { RichEmbed } from 'discord.js'
import { get } from 'unirest'
import urlJoin from 'url-join'

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

  /**
   * Run this command
   * @param client Nezuko client
   * @param msg Original message
   * @param args Optional arguments
   */
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { Utils, Log, db, p } = client
    const { channel } = msg
    const {
      bytesToSize,
      sortByKey,
      embed,
      paginate,
      errorMessage,
      standardMessage,
      warningMessage,
      missingConfig
    } = Utils

    // * ------------------ Config --------------------

    const { host, apiKey } = db!.config.jackett

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [
        `${p}config set jackett host <http://ip>`,
        `${p}config set jackett apiKey <APIKEY>`
      ]
      return missingConfig(msg, 'jackett', settings)
    }

    // * ------------------ Logic --------------------
    const fetchResults = async (term: string) => {
      try {
        const response = await get(
          urlJoin(host, `/api/v2.0/indexers/all/results?apikey=${apiKey}&Query=${term}`)
        ).headers({ accept: 'application/json' })
        const { Results } = response.body

        if (Results.length) {
          const filteredResults: any[] = []
          Results.forEach((i: any) => {
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
      return false
    }

    // * ------------------ Usage Logic --------------------
    const results = await fetchResults(args.join(' '))

    if (results) {
      const embedList: RichEmbed[] = []
      results.forEach((i) => {
        const { name, tracker, link, size, seeders, peers } = i
        embedList.push(
          embed('green', 'torrent.png')
            .setTitle(`Torrent Results [ ${args.join(' ')} ]`)
            .addField('Name', `[${name}](${link})`, false)
            .addField('Tracker', tracker, true)
            .addField('Size', size, true)
            .addField('Seeder | Peers', `${seeders} | ${peers}`, true)
        )
      })
      const choice = await paginate(msg, embedList, true)
      if (choice || choice === 0) {
        const m = (await standardMessage(msg, '⏳ Fetching torrent file....')) as NezukoMessage

        await m.delete()
      }
    }
    return
  }
}
