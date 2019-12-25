/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import { get } from 'unirest'
import urlJoin from 'url-join'

export default class SabNZBD extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'sab',
      category: 'Download',
      description: 'sabNZBD Management',
      usage: [`sab list`],
      aliases: ['nzb'],
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

    const { p, Utils, Log } = client

    const {
      errorMessage,
      warningMessage,
      validOptions,
      missingConfig,
      sortByKey,
      embed,
      paginate
    } = Utils

    // * ------------------ Config --------------------

    const { host, apiKey } = client.db!.config.sabnzbd

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [
        `${p}config set sabnzbd host <http://ip>`,
        `${p}config set sabnzbd apiKey <APIKEY>`
      ]
      return missingConfig(msg, 'sabnzbd', settings)
    }

    // * ------------------ Logic --------------------

    const getQueue = async () => {
      try {
        const endpoint = '/api?output=json&mode=queue'
        const response = await get(urlJoin(host, endpoint, `&apikey=${apiKey}`))
        const data = await response.body
        const downloadQueue: any[] = []

        data.queue.slots.forEach((key: any) => {
          downloadQueue.push({
            filename: key.filename,
            index: key.index,
            status: key.status,
            percentage: key.percentage,
            time: { left: key.timeleft, eta: key.eta },
            size: { total: key.size, left: key.sizeleft }
          })
        })
        return sortByKey(downloadQueue, '-index')
      } catch (e) {
        const text = 'Could not connect to sabNZBD'
        Log.error('sabNZBD', text, e)
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
            const { filename, status, percentage, time, size } = item
            embedList.push(
              embed('green', 'sabnzbd.png')
                .setTitle('SabNZBD Queue')
                .addField('Filename', `${filename}`, false)
                .addField('Status', `${status}`, true)
                .addField('Percentage', `${percentage}`, true)
                .addField('Size Total', `${size.total}`, true)
                .addField('Size Left', `${size.left}`, true)
                .addField('Time Left', `${time.left}`, true)
                .addField('ETA', `${time.eta}`, true)
            )
          })
          return paginate(msg, embedList)
        }
        return
      }

      default:
        return validOptions(msg, ['list'])
    }
  }
}
