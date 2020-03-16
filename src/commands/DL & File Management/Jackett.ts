/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { get } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to search your Jackett instance for torrents
 */
export default class Jackett extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      aliases: ['find'],
      args: true,
      category: 'DL & File Management',
      description: 'Search and find torrents',
      name: 'torrent',
      usage: ['find [torrent to look for]']
    })
    this.color = '#282828'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { p } = client
    const {
      bytesToSize,
      sortByKey,
      embed,
      paginate,
      errorMessage,
      warningMessage,
      missingConfig,
      standardMessage
    } = Utils

    // Fetch config from database
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host, apiKey } = config.jackett

    // If host and apikey arent set notify user to set them
    if (!host || !apiKey) {
      const settings = [`${p}config set jackett host <http://ip>`, `${p}config set jackett apiKey <APIKEY>`]
      return missingConfig(msg, 'jackett', settings)
    }

    // Wait message while we are searching for torrents
    const waitMessage = await standardMessage(msg, this.color, 'Searching..')

    /**
     * Fetches results for the provided term
     * @param term torrent to search for
     */
    const fetchResults = async (term: string) => {
      try {
        // Fetch results
        const response = await get(
          urljoin(host, `/api/v2.0/indexers/all/results?apikey=${apiKey}&Query=${term}`)
        ).headers({ accept: 'application/json' })

        // Destructure Results from reponse body
        const { Results } = response.body as JackettAPISearch

        // If there are results
        if (Results.length) {
          // Reformat results to be more parsable
          const filteredResults = Results.map((i) => {
            const { Tracker, Title, Guid, Size, Seeders, Peers } = i

            return {
              name: Title,
              tracker: Tracker,
              link: Guid,
              size: bytesToSize(Size),
              seeders: Seeders,
              peers: Peers
            }
          })

          // Return results sorted by amount of seeder
          return sortByKey(filteredResults, 'seeders')
        }
        // If no results
        await warningMessage(msg, `No results for [ ${term} ]`)
      } catch (e) {
        // If unable to connect to jackett
        await errorMessage(msg, 'Could not connect to Jackett')
      }
    }

    // Fetch results from user search terms
    const results = await fetchResults(args.join(' '))

    // Remove wait message
    await waitMessage.delete()

    // If results for search term
    if (results) {
      // Generate embed list
      const embedList = results.map((i) => {
        const { name, tracker, size, seeders, peers } = i
        return embed(msg, this.color, 'torrent.png')
          .setTitle(`Torrent Results [ ${args.join(' ')} ]`)
          .addField('Name', `${name}`, false)
          .addField('Tracker', tracker, true)
          .addField('Size', size, true)
          .addField('Seeder | Peers', `${seeders} | ${peers}`, true)
      })

      // Paginate results and wait for checkmark reaction for slection
      const choice = await paginate(msg, embedList, true)

      // If user picks a result post the magnet link
      if (choice || choice === 0) return msg.reply(results[0].link)
    }
  }
}
