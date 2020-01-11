/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message, RichEmbed } from 'discord.js'
import { NezukoMessage } from 'typings'
import { get } from 'unirest'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Manga extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'manga',
      category: 'Anime',
      description: 'Search for manga',
      usage: ['manga <manga to look for>'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { standardMessage, embed, paginate, warningMessage } = Utils

    const waitMessage = (await standardMessage(msg, 'Fetching data from the Kitsu API')) as Message

    const response = await get(
      `https://kitsu.io/api/edge/manga?${encodeURIComponent(`filter[text]=${args.join(' ')}`)}`
    )

    if (response.body) {
      const data = response.body.data as MangaSearch[]
      if (data.length) {
        const embedList: RichEmbed[] = []

        data.forEach((manga) => {
          const { id, attributes } = manga

          embedList.push(
            embed()
              .setTitle(
                `Kitsu.io Manga - [ ${attributes.titles.en || attributes.titles.en_jp || attributes.titles.ja_jp} ]`
              )
              .setDescription(attributes.synopsis)
              .addField('Type', attributes.subtype, true)
              .addField('Age Rating', attributes.ageRating ? attributes.ageRating : 'Not Rated', true)
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
