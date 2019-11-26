const fetch = require('node-fetch')
const urljoin = require('url-join')
const Command = require('../../core/Command')

class SabnzbdManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'sab',
      category: 'Download',
      description: 'sabNZBD Management',
      usage: [`sab list`],
      aliases: ['nzb'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
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

    const { host, apiKey } = JSON.parse(client.db.general.sabnzbd)

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [`${p}db set sabnzbd host <http://ip>`, `${p}db set sabnzbd apiKey <APIKEY>`]
      return missingConfig(msg, 'sabnzbd', settings)
    }

    // * ------------------ Logic --------------------

    const getQueue = async () => {
      try {
        const endpoint = '/api?output=json&mode=queue'
        const response = await fetch(urljoin(host, endpoint, `&apikey=${apiKey}`))
        const data = await response.json()
        const downloadQueue = []

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
        return sortByKey(downloadQueue, '-index')
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
          if (!data.length > 0) return warningMessage(msg, `Nothing in download Queue`)

          const embedList = []
          data.forEach((item) => {
            const { filename, status, percentage, time, size } = item
            embedList.push(
              embed(msg)
                .setTitle('SabNZBD Queue')
                .setThumbnail(
                  'https://dashboard.snapcraft.io/site_media/appmedia/2018/10/icon.svg_WxcxD3g.png'
                )
                .addField('Filename', `${filename}`, false)
                .addField('Status', `${status}`, true)
                .addField('Percentage', `${percentage}`, true)
                .addField('Size Total', `${size.total}`, true)
                .addField('Size Left', `${size.left}`, true)
                .addField('Time Left', `${time.left}`, true)
                .addField('ETA', `${time.eta}`, true)
            )
          })
          return paginate(client, msg, embedList, 1)
        }
        return
      }

      default: {
        return validOptions(msg, ['list'])
      }
    }
  }
}
module.exports = SabnzbdManagement
