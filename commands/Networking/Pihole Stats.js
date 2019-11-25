const fetch = require('node-fetch')
const urljoin = require('url-join')
const Command = require('../../core/Command')

class PiHoleController extends Command {
  constructor(client) {
    super(client, {
      name: 'pihole',
      category: 'Networking',
      description: 'PiHole stats and management',
      usage: `pihole <on/off> | pihole stats`,
      aliases: ['dns'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { p, Log, Utils, colors } = client
    const { errorMessage, warningMessage, validOptions, standardMessage, missingConfig } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { host, apiKey } = JSON.parse(client.db.general.pihole)

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [`${p}db set pihole host <PIHOLEURL>`, `${p}db set pihole apiKey <APIKEY>`]
      return missingConfig(msg, 'pihole', settings)
    }

    // * ------------------ Logic --------------------

    const setState = async (newState) => {
      const opt = newState === 'off' ? 'disable' : 'enable'

      try {
        const response = await fetch(urljoin(host, `admin/api.php?${opt}&auth=${apiKey}`))
        const data = await response.json()
        if (data.status !== 'enabled' && data.status !== 'disabled') {
          if (api) return `API key is incorrect`
          return errorMessage(`API key is incorrect`)
        }
        if (api) return `PiHole turned ${newState}`
        return standardMessage(msg, `PiHole turned ${newState}`)
      } catch {
        if (api) return `No connection to PiHole`
        return errorMessage(msg, `No connection to PiHole`)
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
      } catch {}
    }

    // * ------------------ Usage Logic --------------------

    const caseOptions = ['on', 'off', 'stats']
    switch (args[0]) {
      case 'on':
      case 'off':
        return setState(args[0])

      case 'stats': {
        embed.attachFile('./data/images/icons/pihole.png')
        embed.setThumbnail('attachment://pihole.png')
        const status = await getStats()
        if (status) {
          const embed = Utils.embed(msg)
            .setTitle('PiHole Stats')
            .addField('Status', status.status)
            .addField('Domains Being Blocked', status.domainsBeingBlocked)
            .addField('Total Queries', status.totalQueries)
            .addField('Queries Today', status.queriesToday)
            .addField('Ads Blocked Today', status.adsBlockedToday)
          return channel.send(embed)
        }
        if (api) return `No connection to PiHole`
        return errorMessage(msg, `No connection to PiHole`)
      }
      default:
        break
    }
    return validOptions(msg, caseOptions)
  }
}
module.exports = PiHoleController
