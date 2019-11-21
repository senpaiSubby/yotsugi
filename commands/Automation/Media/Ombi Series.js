/*
 * License: GNU GPL 3.0
 * Source: https://github.com/v0idp/Mellow
 * Changes: modified scheme to fit into SubbyBots's command layout
 */
const Command = require('../../../core/Command')
const { RichEmbed } = require('discord.js')
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
      usage: `tv <Series Name> | tv tvdb:289590 `,
      aliases: ['shows', 'series'],
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const Log = client.Log
    const { Utils } = client
    const { author, channel } = msg

    // ------------------------- Config --------------------------
    const { host, apiKey, username } = JSON.parse(client.settings.ombi)

    // ----------------------- Main Logic ------------------------
    const outputTVShow = (show) => {
      const embed = Utils.embed(msg, 'green')
        .setTitle(`${show.title} ${show.firstAired ? `(${show.firstAired.substring(0, 4)})` : ''}`)
        .setDescription(show.overview.substr(0, 255) + '(...)')
        .setFooter(author.username, author.avatarURL)
        .setTimestamp(new Date())
        .setImage(show.banner)
        .setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
        .setThumbnail('https://i.imgur.com/9dcDIYe.png')
        .addField('__Network__', show.network, true)
        .addField('__Status__', show.status, true)

      if (show.available) embed.addField('__Available__', '✅', true)
      if (show.quality) embed.addField('__Quality__', show.quality, true)
      if (show.requested) embed.addField('__Requested__', '✅', true)
      if (show.approved) embed.addField('__Approved__', '✅', true)
      if (show.plexUrl) embed.addField('__Plex__', `[Watch now](${show.plexUrl})`, true)
      if (show.embyUrl) embed.addField('__Emby__', `[Watch now](${show.embyUrl})`, true)

      return channel.send(embed)
    }
    const getTVDBID = async (name) => {
      try {
        const response = await fetch(urljoin(host, '/api/v1/Search/tv/', name), {
          headers: {
            accept: 'application/json',
            ApiKey: apiKey
          }
        })
        const data = await response.json()

        if (data.length > 1) {
          let fieldContent = ''
          data.forEach((show, i) => {
            fieldContent += `${i + 1}) ${show.title} `
            if (show.firstAired) fieldContent += `(${show.firstAired.substring(0, 4)}) `
            fieldContent += `[[TheTVDb](https://www.thetvdb.com/?id=${show.id}&tab=series)]\n`
          })

          const embed = Utils.embed(msg, 'green')
            .setTitle('Ombi TV Show Search')
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
          return msg.reply("Couldn't find the TV show you were looking for. Is the name correct?")
        } else {
          return data[0].id
        }
      } catch (error) {
        Log.warn(error)
        return msg.reply('There was an error in your request.')
      }
    }

    const requestTVShow = async (showMsg, show) => {
      if (
        msg.member.roles.some((role) => role.name === 'requesttv') &&
        !show.available &&
        !show.requested &&
        !show.approved
      ) {
        await msg.reply('If you want to request this TV show please click on the ⬇ reaction.')
        await showMsg.react('⬇')
        try {
          const collected = await showMsg.awaitReactions(
            (reaction, user) => reaction.emoji.name === '⬇' && user.id === author.id,
            { max: 1, time: 120000 }
          )
          try {
            if (collected.first()) {
              await fetch(urljoin(host, '/api/v1/Request/tv/'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ApiKey: apiKey,
                  ApiAlias: `${author.username}#${author.discriminator}`,
                  UserName: username || undefined
                },
                body: JSON.stringify({ tvDbId: show.id, requestAll: true })
              })
              return msg.reply(`Requested **${show.title}** in Ombi.`)
            }
          } catch (error) {
            Log.warn(error)
            return msg.reply('There was an error in your request.')
          }
        } catch {
          return showMsg
        }
      }
      return showMsg
    }
    // ---------------------- Usage Logic ------------------------
    const showName = args.join(' ')

    if (!showName) {
      return msg.reply('Please enter a valid TV show name!')
    }

    let tvdbid = null

    if (showName.startsWith('tvdb:')) {
      const matches = /^tvdb:(\d+)$/.exec(showName)
      if (matches) {
        tvdbid = matches[1]
      } else {
        return msg.reply('Please enter a valid TheTVDB ID!')
      }
    } else {
      tvdbid = await getTVDBID(showName)
    }

    if (tvdbid) {
      try {
        const response = await fetch(urljoin(host, '/api/v1/Search/tv/info/', String(tvdbid)), {
          headers: { ApiKey: apiKey, accept: 'application/json' }
        })
        const data = await response.json()
        const dataMsg = await outputTVShow(data)
        await requestTVShow(dataMsg, data)
      } catch (error) {
        return msg.reply('There was an error in your request.')
      }
    }
  }
}
module.exports = OmbiTV
