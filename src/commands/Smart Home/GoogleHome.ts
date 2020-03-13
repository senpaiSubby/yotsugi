/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Device } from 'google-home-notify-client'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class GoogleHome extends Command {
  public color: string

  constructor(client: BotClient) {
    super(client, {
      name: 'say',
      category: 'Smart Home',
      description: 'Speak through Google Home',
      usage: [`say <msg>`],
      webUI: true,
      args: true,
      ownerOnly: true
    })
    this.color = '#4586F7'
  }

  // TODO add google home typings
  public async run(client: BotClient, msg: NezukoMessage, args: any[], api) {
    const { p, Utils, Log } = client
    const { errorMessage, missingConfig, standardMessage } = Utils

    // Grab Google Home config from database
    const { ip, name, language } = client.db.config.googleHome

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

      const responseText = `Told Google Home to say [ ${textToHaveSpoken} ]`

      if (api) return responseText
      return standardMessage(msg, 'green', responseText)
    } catch (e) {
      const errorText = `Failed to connect to Google Home`

      if (api) return errorText
      Log.error('Google Home', errorText, e)
      await errorMessage(msg, errorText)
    }
  }
}
