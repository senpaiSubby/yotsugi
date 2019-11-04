const fetch = require('node-fetch')
const Discord = require('discord.js')
const urljoin = require('url-join')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'pihole',
    category: 'Networking Tools',
    description: 'PiHole stats and management',
    usage: `${prefix}pihole <on/off> | ${prefix}pihole stats`,
    aliases: ['dns']
  },
  options: {
    enabled: true,
    apiEnabled: true,
    showInHelp: true,
    ownerOnly: true,
    guildOnly: true,
    args: true,
    cooldown: 5
  },
  async execute (client, msg, args, api) {
    //* -------------------------- Setup --------------------------

    //* ------------------------- Config --------------------------

    const { host, apiKey } = client.config.commands.pihole

    //* ----------------------- Main Logic ------------------------

    const setState = async (newState) => {
      const options = ['off', 'on']
      if (!options.includes(newState)) return 'bad params'

      const opt = newState === 'off' ? 'disable' : 'enable'

      try {
        const response = await fetch(urljoin(host, `admin/api.php?${opt}&auth=${apiKey}`))
        const data = await response.json()
        if (data.status !== 'enabled' && data.status !== 'disabled') {
          return 'bad key'
        } else {
          return 'success'
        }
      } catch {
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
      } catch {
        return 'no connection'
      }
    }

    //* ---------------------- Usage Logic ------------------------

    const embed = new Discord.RichEmbed()
    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
      embed.attachFile('./data/images/icons/pihole.png')
      embed.setThumbnail('attachment://pihole.png')
    }

    switch (args[0]) {
      case 'on':
      case 'off': {
        const status = await setState(args[0])

        switch (status) {
          case 'success':
            if (api) return `PiHole turned ${args[0]}.`

            embed.setTitle(`:ok_hand: PiHole turned ${args[0]}.`)
            return msg.channel.send({ embed })

          case 'bad key':
            if (api) return 'API key is incorrect.'

            embed.setTitle(':rotating_light: API key is incorrect.')
            return msg.channel.send({ embed })

          case 'bad params':
            if (api) return 'Valid options are `on/off/stats.'

            embed.setTitle(':rotating_light: Valid options are `on/off/stats`.')
            return msg.channel.send({ embed })

          case 'no connection':
            if (api) return 'No connection to PiHole.'

            embed.setTitle(':rotating_light: No connection to PiHole.')
            return msg.channel.send({ embed })
        }
        break
      }

      case 'stats': {
        const status = await getStats()
        if (status !== 'no connection') {
          if (api) return status

          embed.setTitle('PiHole Stats')
          embed.addField('Status', status.status)
          embed.addField('Domains Being Blocked', status.domainsBeingBlocked)
          embed.addField('Total Queries', status.totalQueries)
          embed.addField('Queries Today', status.queriesToday)
          embed.addField('Ads Blocked Today', status.adsBlockedToday)
          return msg.channel.send({ embed })
        } else {
          if (api) return 'No connection to PiHole.'

          embed.setTitle(':rotating_light: No connection to PiHole.')
          return msg.channel.send({ embed })
        }
      }
      default:
    }
  }
}
