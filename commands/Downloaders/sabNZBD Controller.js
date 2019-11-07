const fetch = require('node-fetch')
const Discord = require('discord.js')
const urljoin = require('url-join')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'sab',
    category: 'Downloaders',
    description: 'sabNZBD Management',
    usage: `${prefix}sab list`,
    aliases: ['nzb']
  },
  options: {
    enabled: true,
    apiEnabled: true,
    showInHelp: true,
    ownerOnly: true,
    guildOnly: true,
    args: false,
    cooldown: 5
  },
  async execute(client, msg, args, api) {
    //* -------------------------- Setup --------------------------
    const { sortByKey, addSpace } = client.utils
    const logger = client.logger

    //* ------------------------- Config --------------------------
    const { host, apiKey } = client.config.commands.sabnzbd

    //* ----------------------- Main Logic ------------------------
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
        let downloadQueue = []
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
        logger.warn(error)
        return 'no connection'
      }
    }

    //* ---------------------- Usage Logic ------------------------

    const embed = new Discord.RichEmbed()

    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
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
                  `**Status:** ${addSpace(9)} ${item.status}\n**Percentage:** ${item.percentage}%\n**Size:** ${addSpace(14)} ${
                    item.size.left
                  }/${item.size.total}\n**Time Left:** ${addSpace(4)} ${item.time.left}`
                )
              }
              return msg.channel.send({ embed })
            } else {
              embed.setTitle("Nothing in sabNZBD's download queue.")
              return msg.channel.send({ embed }).then((msg) => msg.delete(5000))
            }
        }
    }
  }
}
