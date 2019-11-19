/*
 * License: GNU GPL 3.0
 * Source: https://github.com/v0idp/Mellow
 * Changes: modified scheme to fit into SubbyBots's command layout
 */
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
      category: 'Media Management',
      description: 'Search and Request Movies in Ombi.',
      usage: `movie <Movie Name> | movie tmdb:603`,
      aliases: ['film'],
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const Log = client.Log

    // ------------------------- Config --------------------------
    const { host, apiKey, username, requestmovie } = client.config.commands.ombi
    // ----------------------- Main Logic ------------------------
    const outputMovie = (movie) => {
      const movieEmbed = Utils.embed(msg)
        .setTitle(
          `${movie.title} ${
            movie.releaseDate ? `(${movie.releaseDate.split('T')[0].substring(0, 4)})` : ''
          }`
        )
        .setDescription(movie.overview.substr(0, 255) + '(...)')
        .setFooter(
          author.username,
          `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
        )
        .setTimestamp(new Date())
        .setImage('https://image.tmdb.org/t/p/w500' + movie.posterPath)
        .setURL('https://www.themoviedb.org/movie/' + movie.theMovieDbId)
        .setThumbnail('https://i.imgur.com/EQhANAP.png')

      if (movie.available) movieEmbed.addField('__Available__', '✅', true)
      if (movie.quality) movieEmbed.addField('__Quality__', movie.quality, true)
      if (movie.requested) movieEmbed.addField('__Requested__', '✅', true)
      if (movie.approved) movieEmbed.addField('__Approved__', '✅', true)
      if (movie.plexUrl) movieEmbed.addField('__Plex__', `[Watch now](${movie.plexUrl})`, true)
      if (movie.embyUrl) movieEmbed.addField('__Emby__', `[Watch now](${movie.embyUrl})`, true)

      return channel.send({ embed: movieEmbed })
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
        const data = await response.json()

        if (data.length > 1) {
          let fieldContent = ''
          data.forEach((movie, i) => {
            fieldContent += `${i + 1}) ${movie.title} `
            if (movie.releaseDate) fieldContent += `(${movie.releaseDate.substring(0, 4)}) `
            fieldContent += `[[TheMovieDb](https://www.themoviedb.org/movie/${movie.theMovieDbId})]\n`
          })

          const embed = Utils.embed(msg)
            .setTitle('Ombi Movie Search')
            .setDescription('Please select one of the search results. To abort answer **cancel**')
            .addField('__Search Results__', fieldContent)
          await msg.reply({ embed })
          try {
            const collected = await channel.awaitMessages(
              (m) =>
                (!isNaN(parseInt(m.content)) || m.content.startsWith('cancel')) &&
                m.author.id === author.id,
              { max: 1, time: 120000, errors: ['time'] }
            )

            const message = collected.first().content
            const selection = parseInt(message)

            if (message.startsWith('cancel')) {
              return msg.reply('Cancelled command.')
            } else if (selection > 0 && selection <= data.length) {
              return data[selection - 1].id
            } else {
              return msg.reply('Please enter a valid selection!')
            }
          } catch {
            return msg.reply('Cancelled command.')
          }
        } else if (!data.length) {
          return msg.reply("Couldn't find the movie you were looking for. Is the name correct?")
        } else {
          return data[0].id
        }
      } catch (error) {
        Log.warn(error)
        return msg.reply('There was an error in your request.')
      }
    }

    const requestMovie = async (movieMsg, movie) => {
      if (
        (!requestmovie || msg.member.roles.some((role) => role.name === 'requestmovie')) &&
        !movie.available &&
        !movie.requested &&
        !movie.approved
      ) {
        await msg.reply('If you want to request this movie please click on the ⬇ reaction.')
        await movieMsg.react('⬇')

        try {
          const collected = await movieMsg.awaitReactions(
            (reaction, user) => reaction.emoji.name === '⬇' && user.id === author.id,
            { max: 1, time: 120000 }
          )
          try {
            if (collected.first()) {
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
              return msg.reply(`Requested **${movie.title}** in Ombi.`)
            }
          } catch (error) {
            Log.warn(error)
            return msg.reply('There was an error in your request.')
          }
        } catch {
          return movieMsg
        }
      }
      return movieMsg
    }
    // ---------------------- Usage Logic ------------------------
    const movieName = args.join(' ')

    if (!movieName) {
      return msg.reply('Please enter a valid movie name!')
    }

    let tmdbid = null

    if (movieName.startsWith('tmdb:')) {
      const matches = /^tmdb:(\d+)$/.exec(movieName)
      if (matches) {
        tmdbid = matches[1]
      } else {
        return msg.reply('Please enter a valid TMDb ID!')
      }
    } else {
      tmdbid = await getTMDbID(movieName)
    }

    if (tmdbid) {
      try {
        const response = await fetch(urljoin(host, '/api/v1/Search/movie/info/', String(tmdbid)), {
          headers: { ApiKey: apiKey, accept: 'application/json' }
        })
        const data = await response.json()
        const dataMsg = await outputMovie(data)
        await requestMovie(dataMsg, data)
      } catch (error) {
        Log.warn(error)
        return msg.reply('There was an error in your request.')
      }
    }
  }
}
module.exports = OmbiMovies
