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
      usage: [`sab list`]
    })
    this.color = '#FFCA28'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { p } = client

    const { errorMessage, warningMessage, validOptions, missingConfig, sortByKey, embed, paginate } = Utils

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host, apiKey } = config.sabnzbd

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [`${p}config set sabnzbd host <http://ip>`, `${p}config set sabnzbd apiKey <APIKEY>`]
      return missingConfig(msg, 'sabnzbd', settings)
    }

    // * ------------------ Logic --------------------

    const getQueue = async () => {
      try {
        const endpoint = '/api?output=json&mode=queue'
        const response = await get(urljoin(host, endpoint, `&apikey=${apiKey}`))
        const data = response.body as SABNZBD
        const downloadQueue: SabQue[] = []

        if (data) {
          data.queue.slots.forEach((key) => {
            downloadQueue.push({
              filename: key.filename,
              index: key.index,
              status: key.status,
              percentage: key.percentage,
              time: { left: key.timeleft, eta: key.eta },
              size: { total: key.size, left: key.sizeleft }
            })
          })
          return sortByKey(downloadQueue, '-index') as SabQue[]
        }
      } catch (e) {
        const text = 'Could not connect to sabNZBD'
        Log.error('sabNZBD', text, e)
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
            const { filename, status, percentage, time, size } = item
            embedList.push(
              embed(msg, this.color, 'sabnzbd.png')
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
