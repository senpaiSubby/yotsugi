const fetch = require('node-fetch')
const urljoin = require('url-join')
const Command = require('../../core/Command')

module.exports = class PiHole extends Command {
  constructor(client) {
    super(client, {
      name: 'pihole',
      category: 'Networking',
      description: 'PiHole stats and management',
      usage: [`pihole <enable/disable>`, `pihole stats`],
      aliases: ['dns'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { p, Log, Utils } = client
    const { errorMessage, validOptions, missingConfig, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { host, apiKey } = client.db.config.pihole

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [`${p}db set pihole host <PIHOLEURL>`, `${p}db set pihole apiKey <APIKEY>`]
      return missingConfig(msg, 'pihole', settings)
    }

    // * ------------------ Logic --------------------

    const setState = async (newState) => {
      try {
        const response = await fetch(urljoin(host, `admin/api.php?${newState}&auth=${apiKey}`))
        const data = await response.json()
        if (data.status !== 'enabled' && data.status !== 'disabled') {
          if (api) return `API key is incorrect`
          return errorMessage(`API key is incorrect`)
        }
        const text = newState === 'enable' ? 'enabled' : 'disabled'
        const color = newState === 'enable' ? 'green' : 'red'
        if (api) return `PiHole ${text}`
        return channel.send(embed(msg, color).setDescription(`**PiHole ${text}**`))
      } catch (e) {
        if (api) return `Failed to connect to PiHole`
        Log.error('PiHole', 'Failed to connect to PiHole', e)
        await errorMessage(msg, `Failed to connect to PiHole`)
      }
    }

    const getStats = async () => {
      try {
        const response = await fetch(urljoin(host, '/admin/api.php'))
        const data = await response.json()
        return {
          status: data.status,
          domainsBeingBlocked: data.domains_being_blocked,
          totalQueries: data.dns_queries_all_types,
          queriesToday: data.dns_queries_today,
          adsBlockedToday: data.ads_blocked_today
        }
      } catch (e) {
        if (api) return `Failed to connect to PiHole`
        Log.error('PiHole', 'Failed to connect to PiHole', e)
        await errorMessage(msg, `Failed to connect to PiHole`)
      }
    }

    // * ------------------ Usage Logic --------------------

    const caseOptions = ['enable', 'disable', 'stats']
    switch (args[0]) {
      case 'enable':
      case 'disable':
        return setState(args[0])

      case 'stats': {
        const status = await getStats()
        if (status) {
          return channel.send(
            embed(msg)
              .attachFile('./data/images/icons/pihole.png')
              .setThumbnail('attachment://pihole.png')
              .setTitle('PiHole Stats')
              .addField('Status', status.status)
              .addField('Domains Being Blocked', status.domainsBeingBlocked)
              .addField('Total Queries', status.totalQueries)
              .addField('Queries Today', status.queriesToday)
              .addField('Ads Blocked Today', status.adsBlockedToday)
          )
        }
        return
      }
    }
    return validOptions(msg, caseOptions)
  }
}
