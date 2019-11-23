const Command = require('../../../core/Command')
const fetch = require('node-fetch')
const urljoin = require('url-join')

/*
requires role "requestmovie"
*/

class OmbiMovies extends Command {
  constructor(client) {
    super(client, {
      name: 'movie',
      category: 'Media',
      description: 'Search and Request Movies in Ombi.',
      usage: `movie <Movie Name> | movie tmdb:603`,
      aliases: ['film'],
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { p, Log, Utils } = client
    const { author, channel, member } = msg
    const role = msg.guild.roles.find('name', 'requestmovie')
    if (!role) {
      await msg.guild.createRole({ name: 'requestmovie' })
      return msg.channel.send(
        Utils.embed(msg, 'yellow')
          .setTitle('Missing role [requestmovie]')
          .setDescription(
            'I created a role called **requestmovie**. Assign this role to members to let them request movies!'
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
      return channel.send(
        Utils.embed(msg, 'red')
          .setTitle(':gear: Missing Ombi DB config!')
          .setDescription(
            `**${p}db get ombi** for current config.\n\nSet them like so..\n\`\`\`css\n${settings.join(
              '\n'
            )}\n\`\`\``
          )
      )
    }
    // ----------------------- Main Logic ------------------------
    const outputMovie = (movie) => {
      const embed = Utils.embed(msg, 'green')
        .setTitle(
          `${movie.title} ${
            movie.releaseDate ? `(${movie.releaseDate.split('T')[0].substring(0, 4)})` : ''
          }`
        )
        .setDescription(movie.overview.substring(0, 255) + '(...)')
        .setThumbnail('https://image.tmdb.org/t/p/w500' + movie.posterPath)
        .setURL('https://www.themoviedb.org/movie/' + movie.theMovieDbId)

      if (movie.available) embed.addField('__Available__', '✅', true)
      if (movie.quality) embed.addField('__Quality__', movie.quality, true)
      if (movie.requested) embed.addField('__Requested__', '✅', true)
      if (movie.approved) embed.addField('__Approved__', '✅', true)
      if (movie.plexUrl) embed.addField('__Plex__', `[Watch now](${movie.plexUrl})`, true)
      if (movie.embyUrl) embed.addField('__Emby__', `[Watch now](${movie.embyUrl})`, true)

      return embed
    }
    const getTMDbID = async (name) => {
      try {
        const response = await fetch(urljoin(host, '/api/v1/Search/movie/', name), {
          headers: {
            accept: 'application/json',
            ApiKey: apiKey,
            'User-Agent': `Mellow/${process.env.npm_package_version}`
          }
        })
        return response.json()
      } catch {
        return msg.reply(Utils.embed(msg, 'red').setDescription('No connection to Ombi'))
      }
    }

    const requestMovie = async (movie) => {
      if (!member.roles.some((r) => r.name === 'requestmovie')) {
        return msg.reply(
          Utils.embed(msg, 'yellow').setDescription(
            ':octagonal_sign: **You must be part of the `requestmovie` role to request movies.**'
          )
        )
      }

      if (movie.available) {
        const m = await msg.reply(
          Utils.embed(msg, 'yellow').setDescription(
            `:white_check_mark: **${movie.title}** is already available in Ombi`
          )
        )
        return m.delete(20000)
      }

      if (movie.approved) {
        const m = await msg.reply(
          Utils.embed(msg, 'yellow').setDescription(
            `:white_check_mark: **${movie.title}** is already approved in Ombi`
          )
        )
        return m.delete(20000)
      }

      if (movie.requested) {
        const m = await msg.reply(
          Utils.embed(msg, 'yellow').setDescription(
            `:white_check_mark: **${movie.title}** is already requested in Ombi`
          )
        )
        return m.delete(20000)
      }

      if (!movie.available && !movie.requested && !movie.approved) {
        try {
          await fetch(urljoin(host, '/api/v1/Request/movie/'), {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
              ApiKey: apiKey,
              ApiAlias: `${author.username}#${author.discriminator}`,
              UserName: username || undefined
            },
            body: JSON.stringify({ theMovieDbId: movie.theMovieDbId })
          })
          return msg.reply(
            Utils.embed(msg, 'green').setDescription(`Requested **${movie.title}** in Ombi.`)
          )
        } catch {
          const m = await msg.reply(Utils.embed(msg, 'red').setDescription('No connection to Ombi'))
          return m.delete(20000)
        }
      }
    }
    // ---------------------- Usage Logic ------------------------
    const movieName = args.join(' ')

    if (!movieName) {
      const m = await msg.reply(
        Utils.embed(msg, 'yellow').setDescription('**Please enter a valid TV show name!**')
      )
      return m.delete(20000)
    }

    const results = await getTMDbID(movieName)

    if (results) {
      const embedList = []
      for (const movie of results) {
        try {
          const response = await fetch(
            urljoin(host, '/api/v1/Search/movie/info/', String(movie.id)),
            {
              headers: { ApiKey: apiKey, accept: 'application/json' }
            }
          )
          const data = await response.json()
          embedList.push(outputMovie(data))
        } catch {
          const m = await msg.reply(Utils.embed(msg, 'red').setDescription('No connection to Ombi'))
          return m.delete(20000)
        }
      }
      const itemPicked = await Utils.paginate(client, msg, embedList, 2, true)
      return requestMovie(results[itemPicked])
    }
  }
}
module.exports = OmbiMovies
