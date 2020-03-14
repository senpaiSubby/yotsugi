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
      usage: [`tor list`, 'tor add [magnet link]']
    })
    this.color = '#AE0701'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

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
      embed
    } = Utils

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host, port, ssl, username, password } = config.transmission

    // * ------------------ Check Config --------------------

    if (!host || !port) {
      const settings = [
        `${p}config set transmission host <http://ip>`,
        `${p}config set transmission port <port>`,
        `${p}config set transmission ssl <true/false>`
      ]
      return missingConfig(msg, 'transmission', settings)
    }

    const trans = new Trans({
      host, // Default 'localhost'
      port, // Default 9091
      ssl, // Default false use https
      url: '/transmission/rpc', // Default '/transmission/rpc'
      username: username || '',
      password: password || ''
    })

    // * ------------------ Logic --------------------

    const getStatus = (code: number) => {
      switch (code) {
        case 0:
          return 'stopped'
        case 1:
          return 'checkWait'
        case 2:
          return 'checking'
        case 3:
          return 'downloadWait'
        case 4:
          return 'downloading'
        case 5:
          return 'seedWait'
        case 6:
          return 'seeding'
        case 7:
          return 'No Peers'
      }
    }

    // TODO add typing for Transmission wue
    const getQueue = async () => {
      try {
        const response = await trans.get()
        const { torrents } = response
        const downloadQueue: any[] = []

        torrents.forEach((item: any) => {
          const { name, id, rateUpload, rateDownload, downloadedEver, status, sizeWhenDone } = item
          downloadQueue.push({
            name,
            id,
            status: getStatus(status),
            percentage: downloadedEver ? Math.round((downloadedEver / sizeWhenDone) * 100).toString() : '0',
            rate: {
              up: rateUpload ? bytesToSize(rateUpload) : 0,
              down: rateDownload ? bytesToSize(rateDownload) : 0
            },
            size: {
              current: downloadedEver ? bytesToSize(downloadedEver) : 0,
              complete: sizeWhenDone ? bytesToSize(sizeWhenDone) : 0
            }
          })
        })
        return sortByKey(downloadQueue, 'percentage')
      } catch (e) {
        const text = 'Failed to connect to Transmission'
        Log.error('Transmission', text, e)
        await errorMessage(msg, text)
      }
    }

    const addTorrent = async (magnet: string) => {
      try {
        const response = await trans.addUrl(magnet)
        return standardMessage(msg, 'green', `[ ${response.name} ] Added to Transmission`)
      } catch (e) {
        const text = 'Failed to connect to Transmission'
        Log.error('Transmission', text, e)
        await errorMessage(msg, text)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        const data = await getQueue()

        if (data) {
          if (!data.length) {
            return warningMessage(msg, `Nothing in download Queue`)
          }

          const embedList: any[] = []
          data.forEach((item) => {
            const { name, id, status, percentage, rate, size } = item
            embedList.push(
              embed(msg, this.color, 'transmission.png')
                .setTitle('Transmission Queue')
                .addField('Filename', `[ ${id} ] ${name}`, false)
                .addField('Status', `${status}`, true)
                .addField('Percentage', `${percentage}`, true)
                .addField('Size Total', `${size.complete}`, true)
                .addField('Size Current', `${size.current}`, true)
                .addField('Rate Down', `${rate.down}`, true)
                .addField('Rate Upload', `${rate.up}`, true)
            )
          })
          return paginate(msg, embedList)
        }
        return
      }

      case 'add':
        return addTorrent(args[1])

      default:
        return validOptions(msg, ['list', 'add'])
    }
  }
}
