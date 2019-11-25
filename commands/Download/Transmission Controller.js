const Transmission = require('transmission-promise')
const Command = require('../../core/Command')

class TransmissionManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'tor',
      category: 'Download',
      description: 'Transmission Management',
      usage: `tor list`,
      aliases: ['transmission'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { p, Utils } = client
    const {
      bytesToSize,
      sortByKey,
      errorMessage,
      warningMessage,
      validOptions,
      standardMessage,
      missingConfig
    } = Utils

    // * ------------------ Config --------------------

    const { host, port, ssl } = JSON.parse(client.db.general.transmission)

    // * ------------------ Check Config --------------------

    if (!host || !port) {
      const settings = [
        `${p}db set transmission host <http://ip>`,
        `${p}db set transmission port <port>`,
        `${p}db set transmission ssl <true/false>`
      ]
      return missingConfig(msg, 'transmission', settings)
    }

    const trans = new Transmission({
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
        default:
          break
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
      } catch {
        return errorMessage(msg, `Failed to connect to Transmission`)
      }
    }

    const addTorrent = async (magnet) => {
      try {
        const response = await trans.addUrl(magnet)
        return standardMessage(msg, `${response.name}\nAdded to Transmission`)
      } catch {
        return errorMessage(msg, `Failed to connect to Transmission`)
      }
    }

    // * ------------------ Usage Logic --------------------

    const caseOptions = ['list', 'add']
    switch (args[0]) {
      case 'list': {
        const data = await getQueue()
        if (!data.length) return warningMessage(msg, `Nothing in download Queue`)

        const embedList = []
        data.forEach((item) => {
          const { name, id, status, percentage, rate, size } = item
          const embed = Utils.embed(msg)
            .setTitle('Transmission Queue')
            .setThumbnail(
              'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Transmission_Icon.svg/1200px-Transmission_Icon.svg.png'
            )
            .addField('__Filename__', `[${id}] ${name}`, false)
            .addField('__Status__', `${status}`, true)
            .addField('__Percentage__', `${percentage}`, true)
            .addField('__Size Total__', `${size.complete}`, true)
            .addField('__Size Current__', `${size.current}`, true)
            .addField('__Rate Down__', `${rate.down}`, true)
            .addField('__Rate Upload__', `${rate.up}`, true)
          embedList.push(embed)
        })
        return Utils.paginate(client, msg, embedList, 1)
      }

      case 'add':
        return addTorrent(args[1])

      default:
        return validOptions(msg, caseOptions)
    }
  }
}
module.exports = TransmissionManagement
