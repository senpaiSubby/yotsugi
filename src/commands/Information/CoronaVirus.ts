/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { BotClient } from 'core/BotClient'
import fetch from 'node-fetch'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { Utils } from '../../core/Utils'

interface ParsedCoronaInfo {
  country: string
  lastUpdate: string
  confirmed: number
  deaths: number
  recovered: number
  active: number
}

interface CoronaInfo {
  OBJECTID: number
  Country_Region: string
  Last_Update: number
  Lat: number
  Long_: number
  Confirmed: null | number
  Deaths: null | number
  Recovered: null | number
  Active: null | number
}

export default class CoronaVirus extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Information',
      description: 'Get info on the Corona Virus',
      name: 'corona',
      usage: [
        'corona top confirmed',
        'corona top deaths',
        'corona top recovered',
        'corona top active',
        'corona top [country]'
      ]
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { sortByKey, validOptions, embed, errorMessage, warningMessage } = Utils
    const { channel } = msg

    const fetchData = async () => {
      try {
        const reponse = await fetch(
          'https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/2/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&resultOffset=0&resultRecordCount=250&cacheHint=true'
        )

        const json = await reponse.json()
        return json.features.map((r) => r.attributes) as CoronaInfo[]
      } catch {
        // Error fetching data
      }
    }

    const parseResults = async (coronaInfo: CoronaInfo[]) =>
      coronaInfo.map((i) => {
        const { Country_Region, Last_Update, Confirmed, Deaths, Recovered, Active } = i
        return {
          country: Country_Region,
          lastUpdate: new Date(Last_Update).toDateString(),
          confirmed: Confirmed || 0,
          deaths: Deaths || 0,
          recovered: Recovered || 0,
          active: Active || 0
        } as ParsedCoronaInfo
      })

    const data = await fetchData()

    if (data) {
      const results = await parseResults(data)

      const command = args.shift()
      switch (command) {
        case 'country': {
          const countryWanted = args.shift().toLowerCase()
          const countryFound = results.filter((r) => r.country.toLowerCase() === countryWanted)[0]

          if (countryFound) {
            const { country, active, confirmed, recovered, deaths, lastUpdate } = countryFound
            return channel.send(
              embed(msg, '#20BCBE')
                .setTitle('COVID-19 Information')
                .setThumbnail(
                  'https://www.skagitymca.org/sites/skagitymca.org/files/styles/node_blog/public/2020-03/covid-19.png?h=d1cb525d&itok=d4T78JvW'
                )
                .setDescription(`Showing stats for country [ ${countryWanted.toUpperCase()} ]`)
                .addField('Country', country, true)
                .addField('Last Update', lastUpdate, true)
                .addField('Confirmed', confirmed, true)
                .addField('Recovered', recovered, true)
                .addField('Active', active, true)
                .addField('Deaths', deaths, true)
            )
          }
          return warningMessage(msg, `No cases for country [ ${countryWanted} ] found.`)
        }
        case 'top': {
          const statWanted = args.shift().toLowerCase()

          const genEmbed = async (statData: ParsedCoronaInfo) => {
            const { country, active, confirmed, recovered, deaths, lastUpdate } = statData
            return channel.send(
              embed(msg, '#20BCBE')
                .setTitle('COVID-19 Information')
                .setThumbnail(
                  'https://www.skagitymca.org/sites/skagitymca.org/files/styles/node_blog/public/2020-03/covid-19.png?h=d1cb525d&itok=d4T78JvW'
                )
                .setDescription(`Top country for [ ${statWanted.toUpperCase()} ] cases`)
                .addField('Country', country, true)
                .addField('Last Update', lastUpdate, true)
                .addField('Confirmed', confirmed, true)
                .addField('Recovered', recovered, true)
                .addField('Active', active, true)
                .addField('Deaths', deaths, true)
            )
          }

          switch (statWanted) {
            case 'confirmed':
            case 'deaths':
            case 'recovered':
            case 'active': {
              return genEmbed(sortByKey(results, statWanted)[0] as ParsedCoronaInfo)
            }
            default: {
              return validOptions(msg, ['confirmed', 'deaths', 'recovered', 'active'])
            }
          }
        }
        default: {
          return validOptions(msg, ['country', 'top'])
        }
      }
    }
    return errorMessage(msg, 'Failed to gather statistics')
  }
}
