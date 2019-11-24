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
    // -------------------------- Setup --------------------------
    const { p, Log, Utils, colors } = client
    const { errorMessage, warningMessage, validOptions, standardMessage, missingConfig } = Utils
    const { channel } = msg

    // ------------------------- Config --------------------------

    const { host, apiKey } = JSON.parse(client.settings.pihole)
    if (!host || !apiKey) {
      const settings = [`${p}db set pihole host <PIHOLEURL>`, `${p}db set pihole apiKey <APIKEY>`]
      return missingConfig(msg, 'pihole', settings)
    }

    // ----------------------- Main Logic ------------------------

    const setState = async (newState) => {
      const options = ['off', 'on']
      if (!options.includes(newState)) return 'bad params'

      const opt = newState === 'off' ? 'disable' : 'enable'

      try {
        const response = await fetch(urljoin(host, `admin/api.php?${opt}&auth=${apiKey}`))
        const data = await response.json()
        if (data.status !== 'enabled' && data.status !== 'disabled') {
          return 'bad key'
        }
        return 'success'
      } catch (error) {
        Log.warn(error)
        return 'no connection'
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
      } catch (error) {
        Log.warn(error)
        return 'no connection'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg, 'green')

    const caseOptions = ['on', 'off', 'stats']
    switch (args[0]) {
      case 'on':
      case 'off': {
        const status = await setState(args[0])

        switch (status) {
          case 'success':
            if (api) return `PiHole turned ${args[0]}`

            return standardMessage(msg, `PiHole turned ${args[0]}`)
          case 'bad key':
            if (api) return 'API key is incorrect'
            return warningMessage(`API key is incorrect`)
          case 'bad params':
            if (api) return 'Valid options are `on/off/stats'
            return validOptions(msg, ['on', 'off', 'stats'])

          case 'no connection':
            if (api) return 'No connection to PiHole'
            return errorMessage(msg, `No connection to PiHole`)
          default:
            break
        }
        break
      }

      case 'stats': {
        embed.attachFile('./data/images/icons/pihole.png')
        embed.setThumbnail('attachment://pihole.png')
        const status = await getStats()
        if (status !== 'no connection') {
          if (api) return status

          embed.setTitle('PiHole Stats')
          embed.addField('Status', status.status)
          embed.addField('Domains Being Blocked', status.domainsBeingBlocked)
          embed.addField('Total Queries', status.totalQueries)
          embed.addField('Queries Today', status.queriesToday)
          embed.addField('Ads Blocked Today', status.adsBlockedToday)
          return channel.send({ embed })
        }
        if (api) return 'No connection to PiHole'
        embed.setColor(colors.red)
        embed.setTitle(':rotating_light: No connection to PiHole')
        return channel.send({ embed })
      }
      default:
        break
    }
    return validOptions(msg, caseOptions)
  }
}
module.exports = PiHoleController
