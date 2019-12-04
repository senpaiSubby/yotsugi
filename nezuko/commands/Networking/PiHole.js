const { get } = require('unirest')
const urljoin = require('url-join')
const Command = require('../../core/Command')

module.exports = class PiHole extends Command {
  constructor(client) {
    super(client, {
      name: 'pihole',
      category: 'Networking',
      description: 'PiHole stats and management',
      usage: [`pihole <enable/disable>`, `pihole stats`],
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { p, Log, Utils } = client
    const { errorMessage, validOptions, missingConfig, embed, capitalize } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { host, apiKey } = client.db.config.pihole

    // * ------------------ Check Config --------------------

    if (!host || !apiKey) {
      const settings = [
        `${p}config set pihole host <PIHOLEURL>`,
        `${p}config set pihole apiKey <APIKEY>`
      ]
      return missingConfig(msg, 'pihole', settings)
    }

    // * ------------------ Logic --------------------

    const setState = async (newState) => {
      try {
        const response = await get(
          urljoin(host, `admin/api.php?${newState}&auth=${apiKey}`)
        ).headers({ accept: 'application/json' })
        const data = await response.body

        if (data.status !== 'enabled' && data.status !== 'disabled') {
          if (api) return `API key is incorrect`
          return errorMessage(`API key is incorrect`)
        }

        const text = newState === 'enable' ? 'enabled' : 'disabled'
        const color = newState === 'enable' ? 'green' : 'yellow'

        if (api) return `PiHole [ ${text} ]`
        return channel.send(embed(color).setDescription(`**PiHole [ ${text} ]**`))
      } catch (e) {
        if (api) return `Failed to connect to PiHole`
        Log.error('PiHole', 'Failed to connect to PiHole', e)
        await errorMessage(msg, `Failed to connect to PiHole`)
      }
    }

    const getStats = async () => {
      try {
        const response = await get(urljoin(host, '/admin/api.php')).headers({
          accept: 'application/json'
        })
        const data = await response.body

        return {
          status: data.status,
          domainsBeingBlocked: data.domains_being_blocked,
          totalQueries: data.dns_queries_all_types,
          queriesToday: data.dns_queries_today,
          adsBlockedToday: data.ads_blocked_today,
          clientsSeen: data.clients_ever_seen,
          clientsUnique: data.unique_clients,
          forwarded: data.queries_forwarded,
          cached: data.queries_cached,
          blockedPercentage: data.ads_percentage_today
        }
      } catch (e) {
        if (api) return `Failed to connect to PiHole`
        Log.error('PiHole', 'Failed to connect to PiHole', e)
        await errorMessage(msg, `Failed to connect to PiHole`)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'enable':
      case 'disable':
        return setState(args[0])

      case 'stats': {
        const status = await getStats()
        if (status) {
          const statusColor = status.status === 'enabled' ? 'green' : 'yellow'
          return channel.send(
            embed(statusColor, 'pi.png')
              .setTitle('PiHole Stats')
              .addField('Status', capitalize(status.status), true)
              .addField("URL's Being Blocked", status.domainsBeingBlocked, true)
              .addField('Total Queries', status.totalQueries, true)
              .addField('Queries Today', status.queriesToday, true)
              .addField('Blocked Today', status.adsBlockedToday, true)
              .addField('Queries Today', status.queriesToday, true)
              .addField('Forwarded', status.forwarded, true)
              .addField('Cached', status.cached, true)
              .addField('Percentage', Math.round(status.blockedPercentage), true)
          )
        }
        return
      }
    }
    return validOptions(msg, ['enable', 'disable', 'stats'])
  }
}
