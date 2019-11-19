const fetch = require('node-fetch')
const urljoin = require('url-join')
const Command = require('../../../core/Command')

class SabnzbdManagement extends Command {
  constructor(client) {
    super(client, {
      name: 'sab',
      category: 'Downloaders',
      description: 'sabNZBD Management',
      usage: `sab list`,
      aliases: ['nzb'],
      ownerOnly: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { sortByKey, addSpace } = client.Utils
    const { Utils } = client
    const { author, channel } = msg
    const { Log } = client

    // ------------------------- Config --------------------------
    const { host, apiKey } = client.config.commands.sabnzbd

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
        const results = data.queue

        for (const key of results.slots) {
          downloadQueue.push({
            filename: key.filename,
            status: key.status,
            percentage: key.percentage,
            time: { left: key.timeleft, eta: key.eta },
            size: { total: key.size, left: key.sizeleft }
          })
        }
        return sortByKey(downloadQueue, 'percentage')
      } catch (error) {
        Log.warn(error)
        return 'no connection'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg)

    if (!api) {
      embed.setFooter(`Requested by: ${author.username}`, author.avatarURL)
    }

    const status = await getQueue()

    switch (args[0]) {
      case 'list':
        embed.setTitle('sabNZBD Downloads')
        // todo limit to 25 fields
        switch (status) {
          case 'no connection':
            return

          default:
            if (status.length) {
              for (const item of status) {
                embed.addField(
                  item.filename,
                  `**Status:** ${addSpace(9)} ${item.status}\n**Percentage:** ${
                    item.percentage
                  }%\n**Size:** ${addSpace(14)} ${item.size.left}/${
                    item.size.total
                  }\n**Time Left:** ${addSpace(4)} ${item.time.left}`
                )
              }
              return channel.send({ embed })
            }
            embed.setTitle("Nothing in sabNZBD's download queue.")
            return channel.send({ embed }).then((m) => m.delete(10000))
        }
      default:
        break
    }
  }
}
module.exports = SabnzbdManagement
