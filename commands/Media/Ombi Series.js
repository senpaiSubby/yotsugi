const Command = require('../../core/Command')
const fetch = require('node-fetch')
const urljoin = require('url-join')

/*
requires role "requesttv"
*/

class OmbiTV extends Command {
  constructor(client) {
    super(client, {
      name: 'tv',
      category: 'Media',
      description: 'Search and Request TV Shows in Ombi.',
      usage: `tv <Series Name> `,
      aliases: ['shows', 'series'],
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { p, Utils } = client
    const { errorMessage, warningMessage, standardMessage } = Utils
    const { author, member } = msg

    const role = msg.guild.roles.find('name', 'requesttv')
    if (!role) {
      await msg.guild.createRole({ name: 'requesttv' })
      return msg.channel.send(
        Utils.embed(msg, 'yellow')
          .setTitle('Missing role [requesttv]')
          .setDescription(
            'I created a role called **requesttv**. Assign this role to members to let them request TV Shows!'
          )
      )
    }

    // ------------------------- Config --------------------------
    const { host, apiKey, username } = JSON.parse(client.settings.ombi)

    if (!host || !apiKey || !username) {
      const settings = [
        `${p}db set ombi host <http://ip>`,
        `${p}db set ombi apiKey <APIKEY>`,
        `${p}db set ombi username <USER>`
      ]
      return missingConfig(msg, 'ombi', settings)
    }

    // ----------------------- Main Logic ------------------------
    const outputTVShow = (show) => {
      const embed = Utils.embed(msg, 'green')
        .setTitle(`${show.title} ${show.firstAired ? `(${show.firstAired.substring(0, 4)})` : ''}`)
        .setDescription(`${show.overview.substr(0, 255)}(...)`)
        .setThumbnail(show.banner)
        .setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
        .addField('__Network__', show.network, true)
        .addField('__Status__', show.status, true)
        .addField('__TVDB ID__', show.id, true)

      if (show.available) embed.addField('__Available__', '✅', true)
      if (show.quality) embed.addField('__Quality__', show.quality, true)
      if (show.requested) embed.addField('__Requested__', '✅', true)
      if (show.approved) embed.addField('__Approved__', '✅', true)
      if (show.plexUrl) embed.addField('__Plex__', `[Watch Now](${show.plexUrl})`, true)
      if (show.embyUrl) embed.addField('__Emby__', `[Watch Now](${show.embyUrl})`, true)

      return embed
    }

    const getTVDBID = async (name) => {
      try {
        const response = await fetch(urljoin(host, '/api/v1/Search/tv/', name), {
          headers: {
            accept: 'application/json',
            ApiKey: apiKey
          }
        })
        return response.json()
      } catch {
        return msg.reply(Utils.embed(msg, 'red').setDescription('No connection to Ombi'))
      }
    }

    const requestTVShow = async (show) => {
      if (!member.roles.some((r) => r.name === 'requesttv')) {
        return warningMessage(msg, 'You must be part of the `requesttv` role to request TV Shows.')
      }

      if (show.available) {
        return warningMessage(msg, `${show.title} is already available in Ombi`)
      }

      if (show.approved) {
        return warningMessage(msg, `${show.title} is already approved in Ombi`)
      }

      if (show.requested) {
        return warningMessage(msg, `${show.title} is already requested in Ombi`)
      }

      if (!show.available && !show.requested && !show.approved) {
        try {
          await fetch(urljoin(host, '/api/v1/Request/tv/'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ApiKey: apiKey,
              ApiAlias: `${author.tag}`
            },
            body: JSON.stringify({ tvDbId: show.id, requestAll: true })
          })
          return standardMessage(msg, `Requested ${show.title} in Ombi`)
        } catch {
          return errorMessage(msg`No connection to Ombi`)
        }
      }
    }
    // ---------------------- Usage Logic ------------------------
    const showName = args.join(' ')

    if (!showName) {
      return warningMessage(msg, `Please enter a valid TV show name!`)
    }

    const results = await getTVDBID(showName)

    if (results) {
      const embedList = []
      for (const show of results) {
        try {
          const response = await fetch(urljoin(host, '/api/v1/Search/tv/info/', String(show.id)), {
            headers: { ApiKey: apiKey, accept: 'application/json' }
          })
          const data = await response.json()
          embedList.push(outputTVShow(data))
        } catch {
          return errorMessage(msg, `No connection to Ombi`)
        }
      }
      const itemPicked = await Utils.paginate(client, msg, embedList, 2, true)
      return requestTVShow(results[itemPicked])
    }
  }
}
module.exports = OmbiTV
