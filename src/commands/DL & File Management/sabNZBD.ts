/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { get } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to add and view download information from sabNZBD
 */
export default class SabNZBD extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'DL & File Management',
      description: 'Control SABNZBD downloads',
      name: 'sab',
      usage: ['sab list']
    })
    this.color = '#FFCA28'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { p } = client

    const { errorMessage, warningMessage, validOptions, missingConfig, sortByKey, embed, paginate } = Utils

    // Load config from database
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host, apiKey } = config.sabnzbd

    // Check if host and apiKey are set, if not inform user
    if (!host || !apiKey) {
      const settings = [`${p}config set sabnzbd host <http://ip>`, `${p}config set sabnzbd apiKey <APIKEY>`]
      return missingConfig(msg, 'sabnzbd', settings)
    }

    /**
     * Fetchs the download queue
     */
    const getQueue = async () => {
      try {
        // Endpoint for download queue
        const endpoint = '/api?output=json&mode=queue'

        // Fetch reponse
        const response = await get(urljoin(host, endpoint, `&apikey=${apiKey}`))

        // Parse results in JSON
        const data = response.body as SABNZBD

        // If results
        if (data) {
          // Remap queue into a parsable format
          const downloadQueue = data.queue.slots.map((key) => ({
            filename: key.filename,
            index: key.index,
            status: key.status,
            percentage: key.percentage,
            time: { left: key.timeleft, eta: key.eta },
            size: { total: key.size, left: key.sizeleft }
          }))

          // Return the array sorted by index
          return sortByKey(downloadQueue, '-index') as SabQue[]
        }
      } catch (e) {
        // If error fetching queue
        await errorMessage(msg, 'Could not connect to sabNZBD')
      }
    }

    const option = args.shift()

    switch (option) {
      case 'list': {
        // Fetch download queue
        const data = await getQueue()

        // If download results
        if (data && data.length) {
          // Generate embed list
          const embedList = data.map((item) => {
            const { filename, status, percentage, time, size } = item

            return embed(msg, this.color, 'sabnzbd.png')
              .setTitle('SabNZBD Queue')
              .addField('Filename', `${filename}`, false)
              .addField('Status', `${status}`, true)
              .addField('Percentage', `${percentage}`, true)
              .addField('Size Total', `${size.total}`, true)
              .addField('Size Left', `${size.left}`, true)
              .addField('Time Left', `${time.left}`, true)
              .addField('ETA', `${time.eta}`, true)
          })

          // Send results
          return paginate(msg, embedList)
        }
        // Else nothing is in download queue
        return warningMessage(msg, 'Nothing in download Queue')
      }

      // If none of the above options are specified
      default:
        return validOptions(msg, ['list'])
    }
  }
}
