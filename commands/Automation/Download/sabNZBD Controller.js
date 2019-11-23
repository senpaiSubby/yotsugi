const fetch = require('node-fetch')
const urljoin = require('url-join')
const Command = require('../../../core/Command')

class SabnzbdManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'sab',
      category: 'Download',
      description: 'sabNZBD Management',
      usage: `sab list`,
      aliases: ['nzb'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    // -------------------------- Setup --------------------------
    const { sortByKey } = client.Utils
    const { p, Utils } = client
    const { errorMessage, warningMessage, validOptions, missingConfig } = Utils
    const { channel } = msg

    // ------------------------- Config --------------------------
    const { host, apiKey } = JSON.parse(client.settings.sabnzbd)
    if (!host || !apiKey) {
      const settings = [`${p}db set sabnzbd host <http://ip>`, `${p}db set sabnzbd apiKey <APIKEY>`]
      return missingConfig(msg, 'sabnzbd', settings)
    }

    // ----------------------- Main Logic ------------------------
    /**
     * Fetches the download queue
     * @type {Object}
     * @return {Promise} asd
     */
    const getQueue = async () => {
      try {
        const endpoint = '/api?output=json&mode=queue'
        const response = await fetch(urljoin(host, endpoint, `&apikey=${apiKey}`))
        const data = await response.json()
        const downloadQueue = []

        data.queue.slots.forEach((key) => {
          downloadQueue.push({
            filename: key.filename,
            status: key.status,
            percentage: key.percentage,
            time: { left: key.timeleft, eta: key.eta },
            size: { total: key.size, left: key.sizeleft }
          })
        })
        return sortByKey(downloadQueue, 'percentage')
      } catch {
        return errorMessage(msg, 'Could not connect to sabNZBD')
      }
    }

    // ---------------------- Usage Logic ------------------------

    const data = await getQueue()

    const caseOptions = ['list']
    switch (args[0]) {
      case 'list': {
        if (!data.length > 0) {
          return warningMessage(msg, `Nothing in download Queue`)
        }
        const embedList = []
        data.forEach((item) => {
          const { filename, status, percentage, time, size } = item
          const embed = Utils.embed(msg, 'green')
            .setTitle('SabNZBD Queue')
            .setThumbnail(
              'https://dashboard.snapcraft.io/site_media/appmedia/2018/10/icon.svg_WxcxD3g.png'
            )
            .addField('__Filename__', `${filename}`, false)
            .addField('__Status__', `${status}`, true)
            .addField('__Percentage__', `${percentage}`, true)
            .addField('__Size Total__', `${size.total}`, true)
            .addField('__Size Left__', `${size.left}`, true)
            .addField('__Time Left__', `${time.left}`, true)
            .addField('__ETA__', `${time.eta}`, true)
          embedList.push(embed)
        })
        return Utils.paginate(client, msg, embedList, 1)
      }

      default: {
        return validOptions(msg, caseOptions)
      }
    }
  }
}
module.exports = SabnzbdManagement
