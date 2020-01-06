/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { GeneralDBConfig, NezukoMessage } from 'typings'

import Scraper from '@jonstuebe/scraper'
import { RichEmbed } from 'discord.js'
import { Command } from '../../core/base/Command'
import database from '../../core/database/index'
import { NezukoClient } from '../../core/NezukoClient'

export default class AmazonPriceTracker extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'price',
      category: 'General',
      description: 'Amazon price tracker',
      usage: [`price watch <amazon link>`, 'price watching'],
      webUI: true,
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api) {
    // * ------------------ Setup --------------------

    const { p, Utils, Log } = client

    const { errorMessage, warningMessage, validOptions, paginate, embed } = Utils

    const { channel } = msg

    const db = await database.models.GeneralConfig.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { priceTracking } = config

    const fetchProduct = async (url: string) => {
      const product = await Scraper(url)

      if (product) {
        const productInfo = {
          title: product.title,
          price: product.price,
          image: product.image
        }
        return productInfo
      }
    }

    switch (args[0]) {
      case 'watch': {
        const link = args[1]

        if (!link) return warningMessage(msg, 'Please specify the product link to watch')

        for (const item of priceTracking) {
          if (item.link === link) return warningMessage(msg, 'I\'m already tracking that product')
        }

        const productInfo = await fetchProduct(link)
        console.log(productInfo)

        if (productInfo) {
          const { title, price, image } = productInfo

          const watchInfo = {
            title,
            image,
            link,
            originalPrice: price,
            newPrice: price,
            difference: 0
          }
          priceTracking.push(watchInfo)

          await db.update({ config: JSON.stringify(config) })

          return channel.send(
            embed()
              .addField('Product', productInfo.title)
              .addField('Price', productInfo.price)
              .setThumbnail(productInfo.image)
          )
        }
        return errorMessage(msg, 'Sorry bro. Couln\'t find a product with that link')
      }

      case 'watching': {
        const embedList: RichEmbed[] = []

        for (const item of priceTracking) {
          const { title, originalPrice, newPrice, difference, image } = item
          console.log(item)

          embedList.push(
            embed()
              .setTitle('Amazon Watch List')
              .addField('Product', title)
              .addField('Original Price', originalPrice, true)
              .addField('New Price', newPrice, true)
              .addField('Difference', difference, true)
              .setThumbnail(image)
          )
        }
        return channel.send(paginate(msg, embedList))
      }
      default: {
        return validOptions(msg, ['watch', 'watching'])
      }
    }
  }
}
