/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import transmissionPromise from 'transmission-promise'

export default class Transmission extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'tor',
      category: 'Download',
      description: 'Transmission Management',
      usage: [`tor list`, 'tor add <magnet link>'],
      aliases: ['transmission'],
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

    const { p, Utils, Log, db } = client
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

    const { host, port, ssl } = db!.config.transmission

    // * ------------------ Check Config --------------------

    if (!host || !port) {
      const settings = [
        `${p}config set transmission host <http://ip>`,
        `${p}config set transmission port <port>`,
        `${p}config set transmission ssl <true/false>`
      ]
      return missingConfig(msg, 'transmission', settings)
    }

    const trans = new transmissionPromise({
      host, // Default 'localhost'
      port, // default 9091
      ssl, // Default false use https
      url: '/transmission/rpc' // Default '/transmission/rpc'
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
        default:
          return false
      }
    }

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
            percentage: downloadedEver
              ? Math.round((downloadedEver / sizeWhenDone) * 100).toString()
              : '0',
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
      return false
    }

    const addTorrent = async (magnet: string) => {
      try {
        const response = await trans.addUrl(magnet)
        return standardMessage(msg, `[ ${response.name} ] Added to Transmission`)
      } catch (e) {
        const text = 'Failed to connect to Transmission'
        Log.error('Transmission', text, e)
        await errorMessage(msg, text)
      }
      return false
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        const data = await getQueue()

        if (data) {
          if (!data.length) return warningMessage(msg, `Nothing in download Queue`)

          const embedList: any[] = []
          data.forEach((item) => {
            const { name, id, status, percentage, rate, size } = item
            embedList.push(
              embed('green', 'transmission.png')
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
