const { get, post } = require('unirest')
const urljoin = require('url-join')
const Command = require('../../core/Command')

/*
requires role "requesttv"
*/

module.exports = class OmbiTV extends Command {
  constructor(client) {
    super(client, {
      name: 'tv',
      category: 'Media',
      description: 'Search and request TV Shows via Ombi',
      usage: [`tv <Series Name>`],
      aliases: ['series'],
      args: true
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { p, Utils, Logger } = client
    const { errorMessage, warningMessage, standardMessage, missingConfig, embed, paginate } = Utils
    const { author, member } = msg

    const role = msg.guild.roles.find((r) => r.name === 'requesttv')
    if (!role) {
      await msg.guild.createRole({ name: 'requesttv' })
      return msg.channel.send(
        embed('yellow')
          .setTitle('Missing role [ requesttv ]')
          .setDescription(
            'I created a role called **requesttv**. Assign this role to members to let them request TV Shows!'
          )
      )
    }

    // * ------------------ Config --------------------

    const { host, apiKey, username } = client.db.config.ombi

    // * ------------------ Config --------------------

    if (!host || !apiKey || !username) {
      const settings = [
        `${p}config set ombi host <http://ip>`,
        `${p}config set ombi apiKey <APIKEY>`,
        `${p}config set ombi username <USER>`
      ]
      return missingConfig(msg, 'ombi', settings)
    }

    // * ------------------ Logic --------------------

    const outputTVShow = (show) => {
      const e = embed('green', 'ombi.png')
        .setTitle(`${show.title} ${show.firstAired ? `(${show.firstAired.substring(0, 4)})` : ''}`)
        .setDescription(`${show.overview.substr(0, 255)}(...)`)
        .setThumbnail(show.banner)
        .setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
        .addField('Network', show.network, true)
        .addField('Status', show.status, true)
        .addField('TVDB ID', show.id, true)

      if (show.available) e.addField('Available', '✅', true)
      if (show.quality) e.addField('Quality', show.quality, true)
      if (show.requested) e.addField('Requested', '✅', true)
      if (show.approved) e.addField('Approved', '✅', true)
      if (show.plexUrl) e.addField('Plex', `[Watch Now](${show.plexUrl})`, true)
      if (show.embyUrl) e.addField('Emby', `[Watch Now](${show.embyUrl})`, true)

      return e
    }

    const getTVDBID = async (name) => {
      try {
        const response = await get(urljoin(host, '/api/v1/Search/tv/', name)).headers({
          accept: 'application/json',
          ApiKey: apiKey
        })
        return response.body
      } catch (e) {
        const text = 'Failed to connect to Ombi'
        Logger.error('Ombi Movies', text, e)
        await errorMessage(msg, text)
      }
    }

    const requestTVShow = async (show) => {
      if (!member.roles.some((r) => r.name === 'requesttv')) {
        return warningMessage(
          msg,
          'You must be part of the [ `requesttv` ] role to request TV Shows.'
        )
      }

      if (show.available) {
        return warningMessage(msg, `[ ${show.title} ] is already available in Ombi`)
      }

      if (show.approved) return warningMessage(msg, `[ ${show.title} ] is already approved in Ombi`)

      if (show.requested) {
        return warningMessage(msg, `[ ${show.title} ] is already requested in Ombi`)
      }

      if (!show.available && !show.requested && !show.approved) {
        try {
          await post(urljoin(host, '/api/v1/Request/tv/'))
            .headers({
              'Content-Type': 'application/json',
              ApiKey: apiKey,
              ApiAlias: `${author.tag}`
            })
            .send({ tvDbId: show.id, requestAll: true })
          return standardMessage(msg, `Requested [ ${show.title} ] in Ombi`)
        } catch (e) {
          const text = 'Failed to connect to Ombi'
          Logger.error('Ombi Movies', text, e)
          await errorMessage(msg, text)
        }
      }
    }

    // * ------------------ Usage Logic --------------------

    const showName = args.join(' ')

    if (!showName) return warningMessage(msg, `Please enter a valid TV show name!`)

    const results = await getTVDBID(showName)

    if (results) {
      const embedList = []
      for (const show of results) {
        try {
          const response = await get(
            urljoin(host, '/api/v1/Search/tv/info/', String(show.id))
          ).headers({ ApiKey: apiKey, accept: 'application/json' })
          const data = await response.body
          embedList.push(outputTVShow(data))
        } catch (e) {
          const text = 'Failed to connect to Ombi'
          Logger.error('Ombi Movies', text, e)
          await errorMessage(msg, text)
        }
      }

      const itemPicked = await paginate(msg, embedList, true)
      return requestTVShow(results[itemPicked])
    }
  }
}
