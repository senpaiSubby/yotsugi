/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message, RichEmbed } from 'discord.js'
import { NezukoMessage } from 'typings'
import { get } from 'unirest'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Anime extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'anime',
      category: 'Anime',
      description: 'Search for anime',
      usage: ['anime <anime to look for>'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { standardMessage, embed, paginate, warningMessage } = Utils

    const waitMessage = (await standardMessage(msg, 'Fetching data from the Kitsu API')) as Message

    const response = await get(
      `https://kitsu.io/api/edge/anime?${encodeURIComponent(`filter[text]=${args.join(' ')}`)}`
    )

    // Fs.writeFile('data.json', JSON.stringify(response.body), () => null)

    if (response.body) {
      const { data } = response.body as AnimeSearch
      if (data.length) {
        const embedList: RichEmbed[] = []

        data.forEach((show) => {
          const { id, attributes } = show

          embedList.push(
            embed()
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
          )
        })

        await waitMessage.delete()
        return paginate(msg, embedList)
      }
    }

    await waitMessage.delete()
    return warningMessage(msg, 'No anime found by that name')
  }
}
