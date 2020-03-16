/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import Trans from 'transmission-promise'
import { GeneralDBConfig, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to add and view Transmission downloads
 */
export default class Transmission extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'DL & File Management',
      description: 'Control Transmission downloads',
      name: 'tor',
      usage: ['tor list', 'tor add [magnet link]']
    })
    this.color = '#AE0701'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { p } = client
    const {
      bytesToSize,
      sortByKey,
      errorMessage,
      warningMessage,
      validOptions,
      standardMessage,
      missingConfig,
      paginate,
      embed,
      arraySplitter
    } = Utils

    // Fetch config from database
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host, port, ssl, username, password } = config.transmission

    // If host and port arent set
    if (!host || !port) {
      const settings = [
        `${p}config set transmission host <http://ip>`,
        `${p}config set transmission port <port>`,
        `${p}config set transmission ssl <true/false>`
      ]
      return missingConfig(msg, 'transmission', settings)
    }

    // Connect to transmission client
    const trans = new Trans({
      host, // Default 'localhost'
      port, // Default 9091
      ssl, // Default false use https
      url: '/transmission/rpc', // Default '/transmission/rpc'
      username: username || '',
      password: password || ''
    })

    /**
     * Translates Transmissions status code to human format
     * @param code transmission status code
     */
    const getStatus = (code: number) => {
      switch (code) {
        case 0:
          return 'stopped'
        case 1:
          return 'checkWait'
        case 2:
          return 'checking'
        case 3:
          return 'waiting'
        case 4:
          return 'downloading'
        case 5:
          return 'seedWait'
        case 6:
          return 'seeding'
        case 7:
          return 'dead'
      }
    }

    /**
     * Fetches download queue
     */
    const getQueue = async () => {
      try {
        // Fetch response
        const response = await trans.get()
        const { torrents } = response

        // Parse download queue
        const downloadQueue = torrents.map((item: any) => {
          const { name, id, rateUpload, rateDownload, downloadedEver, status, sizeWhenDone } = item

          return {
            name,
            id,
            status: getStatus(status),
            percentage: downloadedEver ? Math.round((downloadedEver / sizeWhenDone) * 100).toString() : '0',
            uploadSpeed: rateUpload || 0,
            downloadSpeed: rateDownload || 0,
            currentSize: downloadedEver ? bytesToSize(downloadedEver) : 0,
            completedSize: sizeWhenDone ? bytesToSize(sizeWhenDone) : 0
          }
        })

        // Return queue sorted by completed percentage
        return sortByKey(downloadQueue, 'downloadSpeed')
      } catch (e) {
        await errorMessage(msg, 'Failed to connect to Transmission')
      }
    }

    /**
     * Adds a torrent via magnet link to Transmission
     * @param magnet marget link to add
     */
    const addTorrent = async (magnet: string) => {
      try {
        // Add magnet to dl queue
        const response = await trans.addUrl(magnet)

        // Return success status
        return standardMessage(msg, 'green', `[ ${response.name} ] Added to Transmission`)
      } catch (e) {
        // If torrent failed to add
        await errorMessage(msg, 'Failed to connect to Transmission')
      }
    }

    // User selected option
    const option = args.shift()

    switch (option) {
      // Lists all downloads
      case 'list': {
        let data = await getQueue()

        // If downloads in queue
        if (data && data.length) {
          const filter = args.shift()

          switch (filter) {
            case 'stopped':
            case 'seeding':
            case 'dead':
            case 'waiting':
            case 'downloading':
              data = data.filter((r) => r.status === filter)
            case 'all': {
              const text = sortByKey(data, 'down').map(
                (r) =>
                  // tslint:disable-next-line:prefer-template
                  `**${r.name}**\n` +
                  '```\n' +
                  `Status:         ${r.status.toUpperCase()}\n` +
                  `Size:           ${r.currentSize} / ${r.completedSize}\n` +
                  `Percentage:     ${r.percentage}%\n` +
                  `Download Speed: ${bytesToSize(r.downloadSpeed)}/s\n` +
                  `Upload Speed:   ${bytesToSize(r.uploadSpeed)}/s\n` +
                  '```'
              )

              const embedList = arraySplitter(text).map((i) =>
                embed(msg, this.color, 'transmission.png')
                  .setTitle('Transmission Queue')
                  .setDescription(i)
              )

              // Return results
              return paginate(msg, embedList)
            }
            default:
              return validOptions(msg, ['all', 'stopped', 'seeding', 'dead', 'waiting', 'downloading'])
          }
        }
        // Else nothing in download wueue
        return warningMessage(msg, 'Nothing in download Queue')
      }

      // Adds a torrent via magnet link
      case 'add':
        return addTorrent(args[1])

      // If user chooses neither of the above options
      default:
        return validOptions(msg, ['list', 'add'])
    }
  }
}
