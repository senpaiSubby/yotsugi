/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'

/**
 * Command to search the NPM package repos
 */
export default class SearchNPM extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Information',
      description: 'Search the NPM package repos',
      name: 'npm',
      usage: ['npm [search term]']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { execAsync, warningMessage, embed, paginate } = Utils

    // Get search term from user input
    const searchTerm = args.join(' ')

    // Fetch results from npm search in json format
    const { code, stdout: results } = await execAsync(`npm search --json ${searchTerm}`)

    // If results and good exit code
    if (results && code === 0) {
      // Parse stdout output into JSON
      // Generate embed
      const embedList = JSON.parse(results).map((r) => {
        const { name, version, description, date, links, author } = r

        return embed(msg, 'red', 'npm.png')
          .setTitle(`NPM Search [ ${name} ]`)
          .setDescription(description)
          .setURL(links.npm)
          .addField('Author', author.username, true)
          .addField('Version', version, true)
          .addField('Last Updated', new Date(date).toDateString())
      })

      // Return results
      return paginate(msg, embedList)
    }

    // If bad exit code an error occurred while running npm search
    if (code !== 0) return warningMessage(msg, 'An error occurred with NPM')

    // If no results
    return warningMessage(msg, `Couldn't find any NPM packages matching [ ${searchTerm} ]`)
  }
}
