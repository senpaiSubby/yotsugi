/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { get, post } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/*
 requires role "requestmovie"
 */

/**
 * Command to search and request movies in your Ombi server
 */
export default class OmbiMovies extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Media',
      description: 'Search and request movies via Ombi',
      name: 'movie',
      usage: ['movie [Movie Name]', 'movie tmdb:603']
    })
    this.color = '#E37200'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { p } = client
    const { errorMessage, warningMessage, missingConfig, standardMessage, embed, paginate } = Utils
    const { author, channel, member } = msg

    const role = msg.guild.roles.cache.find((r) => r.name === 'requestmovie')
    if (!role) {
      return channel.send(
        Utils.embed(msg, 'yellow')
          .setTitle('Missing role [ requestmovie ]')
          .setDescription(
            'Please created a role called **requestmovie**. Assign this role to members to let them request movies!'
          )
      )
    }

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host, apiKey, username } = config.ombi

    // * ------------------ Check Config --------------------

    if (!host || !apiKey || !username) {
      const settings = [
        `${p}config set ombi host <http://ip>`,
        `${p}config set ombi apiKey <APIKEY>`,
        `${p}config set ombi username <USER>`
      ]
      return missingConfig(msg, 'ombi', settings)
    }

    // * ------------------ Logic --------------------

    const outputMovie = (movie) => {
      const e = embed(msg, this.color, 'ombi.png')
        .setTitle(`${movie.title} ${movie.releaseDate ? `(${movie.releaseDate.split('T')[0].substring(0, 4)})` : ''}`)
        .setDescription(`${movie.overview.substring(0, 255)}(...)`)
        .setThumbnail(`https://image.tmdb.org/t/p/w500${movie.posterPath}`)
        .setURL(`https://www.themoviedb.org/movie/${movie.theMovieDbId}`)

      if (movie.available) e.addField('Available', '✅', true)
      if (movie.quality) e.addField('Quality', movie.quality, true)
      if (movie.requested) e.addField('Requested', '✅', true)
      if (movie.approved) e.addField('Approved', '✅', true)
      if (movie.plexUrl) {
        e.addField('Plex', `[Watch now](${movie.plexUrl})`, true)
      }
      if (movie.embyUrl) {
        e.addField('Emby', `[Watch now](${movie.embyUrl})`, true)
      }

      return e
    }
    const getTMDbID = async (name) => {
      try {
        const response = await get(urljoin(host, '/api/v1/Search/movie/', name)).headers({
          accept: 'application/json',
          ApiKey: apiKey,
          'User-Agent': `Mellow/${process.env.npm_package_version}`
        })
        return response.body
      } catch (e) {
        const text = 'Failed to connect to Ombi'
        Log.error('Ombi Movies', text, e)
        await errorMessage(msg, text)
      }
    }

    const requestMovie = async (movie) => {
      if (!member.roles.cache.some((r) => r.name === 'requestmovie')) {
        return warningMessage(msg, 'You must be part of the [ `requestmovie` ] role to request movies.')
      }

      if (movie.available) {
        return warningMessage(msg, `[ ${movie.title} ] is already available in Ombi`)
      }

      if (movie.approved) {
        return warningMessage(msg, `[ ${movie.title} ] is already approved in Ombi`)
      }

      if (movie.requested) {
        return warningMessage(msg, `[ ${movie.title} ] is already requested in Ombi`)
      }

      if (!movie.available && !movie.requested && !movie.approved) {
        try {
          await post(urljoin(host, '/api/v1/Request/movie/'))
            .headers({
              accept: 'application/json',
              'Content-Type': 'application/json',
              ApiKey: apiKey,
              ApiAlias: `${author.username}#${author.discriminator}`,
              UserName: username || undefined
            })
            .send({ theMovieDbId: movie.theMovieDbId })

          return standardMessage(msg, 'green', `Requested [ ${movie.title} ] in Ombi.`)
        } catch (e) {
          const text = 'Failed to connect to Ombi'
          Log.error('Ombi Movies', text, e)
          await errorMessage(msg, text)
        }
      }
    }

    // * ------------------ Usage Logic --------------------

    const movieName = args.join(' ')

    if (!movieName) {
      return warningMessage(msg, 'Please enter a valid TV show name!')
    }

    const results = await getTMDbID(movieName)

    if (results.length) {
      const embedList = []
      for (const movie of results) {
        try {
          const response = await get(urljoin(host, '/api/v1/Search/movie/info/', String(movie.id))).headers({
            ApiKey: apiKey,
            accept: 'application/json'
          })
          const data = response.body
          embedList.push(outputMovie(data))
        } catch (e) {
          const text = 'Failed to connect to Ombi'
          Log.error('Ombi Movies', text, e)
          await errorMessage(msg, text)
        }
      }

      const itemPicked = await paginate(msg, embedList, true)
      return requestMovie(results[itemPicked])
    }
  }
}
