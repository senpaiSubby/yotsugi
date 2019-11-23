const Transmission = require('transmission-promise')
const Command = require('../../../core/Command')

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
    // -------------------------- Setup --------------------------
    const { bytesToSize, sortByKey } = client.Utils
    const { Log, p } = client
    const { Utils } = client
    const { author, channel } = msg
    // ------------------------- Config --------------------------

    const { host, port, ssl } = JSON.parse(client.settings.transmission)

    if (!host || !port) {
      const settings = [
        `${p}db set emby host <http://ip>`,
        `${p}db set emby port <port>`,
        `${p}db set emby ssl <true/false>`
      ]
      return channel.send(
        Utils.embed(msg, 'red')
          .setTitle(':gear: Missing Transmission DB config!')
          .setDescription(
            `**${p}db get transmission** for current config.\n\nSet them like so..\n\`\`\`css\n${settings.join(
              '\n'
            )}\n\`\`\``
          )
      )
    }

    const trans = new Transmission({
      host, // default 'localhost'
      port, // default 9091
      ssl, // default false use https
      url: '/transmission/rpc' // default '/transmission/rpc'
    })

    // ----------------------- Main Logic ------------------------

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
          downloadQueue.push({
            name: item.name,
            id: item.id,
            status: getStatus(item.status),
            percentage: item.downloadedEver
              ? Math.round((item.downloadedEver / item.sizeWhenDone) * 100).toString()
              : '0',
            rate: {
              up: item.rateUpload ? bytesToSize(item.rateUpload) : 0,
              down: item.rateDownload ? bytesToSize(item.rateDownload) : 0
            },
            size: {
              current: item.downloadedEver ? bytesToSize(item.downloadedEver) : 0,
              complete: item.sizeWhenDone ? bytesToSize(item.sizeWhenDone) : 0
            }
          })
        })
        return sortByKey(downloadQueue, 'percentage')
      } catch (error) {
        Log.warn(error)
        return 'no connection'
      }
    }

    const addTorrent = async (magnet) => {
      try {
        const response = await trans.addUrl(magnet)
        return response.name
      } catch (error) {
        Log.warn(error)
      }
    }
    // todo need to add some type of pagination logic here
    // todo maybe limit number of results to 5 to a page?
    // todo also give options on how to sort/show

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg, 'green')

    switch (args[0]) {
      case 'list': {
        embed.setTitle('Transmission Downloads')

        const dlQueue = await getQueue()
        if (dlQueue === 'no connection')
          return channel.send(embed.setTitle('No connection to Transmission'))

        if (dlQueue.length) {
          dlQueue.forEach((item) => {
            if (item.status === 'downloading') {
              const netStats =
                item.rate.up && item.rate.down === 0
                  ? `- [U ${item.rate.up} | D ${item.rate.down}]`
                  : ''
              embed.addField(
                `${item.id} | ${item.name}`,
                `${item.percentage >= 100 ? ':white_check_mark:' : ':arrow_down:'} ${
                  item.percentage
                }% | ${item.size.current}/${item.size.complete} ${netStats}`
              )
            }
          })
          return channel.send({ embed })
        }
        embed.setTitle("Nothing in Transmission's download queue.")
        const m = await channel.send({ embed })
        return m.delete(10000)
      }

      case 'add': {
        const status = await addTorrent(args[1])
        embed.setTitle(`**${status}**\nAdded to Transmission`)
        return channel.send({ embed })
      }
      default:
        break
    }
  }
}
module.exports = TransmissionManagement
