/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import Scraper from '@jonstuebe/scraper'
import { TextChannel } from 'discord.js'
import { GeneralDBConfig } from 'typings'
import { Subprocess } from '../../core/base/Subprocess'
import database from '../../core/database'
import { CommandManager } from '../../core/managers/CommandManager'
import { NezukoClient } from '../../core/NezukoClient'

export default class PriceTracker extends Subprocess {
  public commandManager: CommandManager

  constructor(client: NezukoClient) {
    super(client, {
      name: 'PriceTracker',
      description: 'Checks prices',
      disabled: false
    })
    this.client = client
  }

  public async run() {
    const { embed } = this.client.Utils
    const priceWatchChannel = this.client.channels.get('663682576954687508') as TextChannel

    const checkPrices = async () => {
      this.client.Log.info('Price Tracker', 'Checking for new prices')

      const db = await database.models.GeneralConfig.findOne({
        where: { id: this.client.config.ownerID }
      })
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

      for (const item of priceTracking) {
        const { title, image, link, originalPrice } = item
        let { newPrice, difference } = item

        const newInfo = await fetchProduct(link)

        if (newInfo) {
          if (originalPrice.replace('$', '') !== newInfo.price.replace('$', '')) {
            newPrice = newInfo.price
            difference = `$ ${originalPrice.replace('$', '') - newInfo.price.replace('$', '')}`

            await db.update({ config: JSON.stringify(config) })

            await priceWatchChannel.send(
              embed()
                .setTitle('Price Alert!')
                .addField('Product', title)
                .addField('Original Price', originalPrice, true)
                .addField('New Price', newPrice, true)
                .addField('Difference', difference, true)
                .setThumbnail(image)
            )
          }
        }
      }
    }

    await checkPrices()
    setInterval(checkPrices, 60 * 1000)
  }
}
