const Trans = require('transmission-promise')
const Command = require('../../core/Command')

module.exports = class Transmission extends Command {
  constructor(client) {
    super(client, {
      name: 'tor',
      category: 'Download',
      description: 'Transmission Management',
      usage: [`tor list`, 'tor add <magnet link>'],
      aliases: ['transmission'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
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

    const { host, port, ssl } = db.config.transmission

    // * ------------------ Check Config --------------------

    if (!host || !port) {
      const settings = [
        `${p}db set transmission host <http://ip>`,
        `${p}db set transmission port <port>`,
        `${p}db set transmission ssl <true/false>`
      ]
      return missingConfig(msg, 'transmission', settings)
    }

    const trans = new Trans({
      host, // default 'localhost'
      port, // default 9091
      ssl, // default false use https
      url: '/transmission/rpc' // default '/transmission/rpc'
    })

    // * ------------------ Logic --------------------

    const getStatus = (code) => {
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

    const getQueue = async () => {
      try {
        const response = await trans.get()
        const { torrents } = response
        const downloadQueue = []

        torrents.forEach((item) => {
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
    }

    const addTorrent = async (magnet) => {
      try {
        const response = await trans.addUrl(magnet)
        return standardMessage(msg, `${response.name}\nAdded to Transmission`)
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
          if (!data.length) return warningMessage(msg, `Nothing in download Queue`)

          const embedList = []
          data.forEach((item) => {
            const { name, id, status, percentage, rate, size } = item
            embedList.push(
              embed(msg)
                .setTitle('Transmission Queue')
                .setThumbnail(
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Transmission_Icon.svg/1200px-Transmission_Icon.svg.png'
                )
                .addField('Filename', `[${id}] ${name}`, false)
                .addField('Status', `${status}`, true)
                .addField('Percentage', `${percentage}`, true)
                .addField('Size Total', `${size.complete}`, true)
                .addField('Size Current', `${size.current}`, true)
                .addField('Rate Down', `${rate.down}`, true)
                .addField('Rate Upload', `${rate.up}`, true)
            )
          })
          return paginate(client, msg, embedList, 1)
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
