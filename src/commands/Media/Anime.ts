/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import { NezukoMessage } from 'typings'
import { get } from 'unirest'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'

/**
 * Command to search Kitsu.io for information on a anime
 */
export default class Anime extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Media',
      description: 'Search Kitsu.io for anime',
      name: 'anime',
      usage: ['anime [anime to look for]']
    })
    this.color = '#E96C55'
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { standardMessage, embed, paginate, warningMessage, errorMessage } = Utils

    const waitMessage = (await standardMessage(msg, this.color, 'Fetching data from the Kitsu API')) as Message

    try {
      const response = await get(
        `https://kitsu.io/api/edge/anime?${encodeURIComponent(`filter[text]=${args.join(' ')}`)}`
      )

      if (response.body) {
        const { data } = response.body as AnimeSearch
        if (data.length) {
          const embedList = data.map((show) => {
            const { attributes } = show

            return embed(msg, this.color)
              .setTitle(
                `Kitsu.io Anime - [ ${attributes.titles.en || attributes.titles.en_jp || attributes.titles.ja_jp} ]`
              )
              .setDescription(`${attributes.synopsis.substring(0, 1021)}...`)
              .addField('Type', attributes.subtype, true)
              .addField('Age Rating', attributes.ageRating ? attributes.ageRating : 'Not rated yet', true)
              .addField('Episodes', attributes.episodeCount, true)
              .addField(
                'Episode Length',
                `${attributes.episodeLength ? `${attributes.episodeLength} minutes` : 'Not calculated yet'}`,
                true
              )
              .addField('Average Rating', attributes.averageRating, true)
              .addField('Popularity Rank', attributes.popularityRank, true)
              .addField(
                'Airing Date',
                `${attributes.startDate || 'Not Aired'} - ${attributes.endDate || 'Not Finished'}`,
                true
              )
              .addField('Status', attributes.status, true)
              .setThumbnail(attributes.posterImage.original)
          })

          await waitMessage.delete()
          return paginate(msg, embedList)
        }
      }

      await waitMessage.delete()
      return warningMessage(msg, 'No anime found by that name')
    } catch {
      return errorMessage(msg, 'I\'m not able to connect to Kitsu.io right now. Please try again later')
    }
  }
}
