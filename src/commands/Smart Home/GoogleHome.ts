/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Device } from 'google-home-notify-client'
import { GeneralDBConfig, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to send text to your google home device to be spoken aloud
 */
export default class GoogleHome extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Smart Home',
      description: 'Speak through Google Home devices',
      name: 'say',
      ownerOnly: true,
      usage: ['say [msg]'],
      webUI: true
    })
    this.color = '#4586F7'
  }

  // TODO add google home typings
  public async run(client: BotClient, msg: NezukoMessage, args: any[], api) {
    const { p } = client
    const { errorMessage, missingConfig, standardMessage } = Utils

    // Grab Google Home config from database
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { ip, name, language } = config.googleHome

    // If config parameters aren't set, notify user
    if (!ip || !name || !language) {
      const settings = [
        `${p}config set googleHome name <name>`,
        `${p}config set googleHome ip <ip addy>`,
        `${p}config set googleHome language <en/fr>`
      ]
      return missingConfig(msg, 'googleHome', settings)
    }

    const textToHaveSpoken = args.join(' ')

    try {
      // Connect to google home device
      const device = new Device(ip, name, language)

      // Send text to be spoken
      await device.notify(textToHaveSpoken)

      return standardMessage(msg, 'green', `Told Google Home to say [ ${textToHaveSpoken} ]`)
    } catch (e) {
      return errorMessage(msg, 'Failed to connect to Google Home')
    }
  }
}
