/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import fetch from 'node-fetch'
import { NezukoMessage } from 'typings'
import zipcodes from 'zipcodes'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Weather extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'weather',
      category: 'Information',
      description: 'Check the weather',
      usage: ['weather <ZIP CODE>']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    const { Utils } = client
    const { errorMessage, embed, warningMessage } = Utils
    const { channel } = msg

    const apiKey = '2e29affaf87d6a928770fe37a6e15d3d'

    const zip = args[0]

    const geo = zipcodes.lookup(zip)

    if (geo) {
      try {
        const response = await fetch(
          `https://api.darksky.net/forecast/${apiKey}/${geo.latitude},${geo.longitude}`
        )
        const data = await response.json()

        if (data) {
          const { city, state, country } = geo
          const { currently, daily, alerts } = data
          const {
            summary,
            icon,
            temperature,
            humidity,
            windSpeed,
            visibility
          } = currently
          const weatherIcon = `https://darksky.net/images/weather-icons/${icon}.png`

          const e = embed(msg)
            .setTitle(`Weather: [ ${country} ${state}, ${city} ]`)
            .setThumbnail(weatherIcon)
            .setDescription(summary)
            .addField('Temperature', `${temperature}`, true)
            .addField('Humidity', `${humidity}`, true)
            .addField('Wind Speed', `${windSpeed}`, true)
            .addField('Visibility', `${visibility}`, true)

          if (alerts) {
            const a = alerts[0]
            e.addField(
              a.title,
              `**Severity:** ${a.severity}
            **Regions:**\n${a.regions.join('\n')}
            **Description:**\n${a.description}`
            )
          }

          return channel.send(e)
        }
      } catch (e) {
        return errorMessage(msg, 'Error fetching weather')
      }
    } else {
      return errorMessage(
        msg,
        `Could not find any area in the US matching zip [ ${zip} ]`
      )
    }
  }
}
