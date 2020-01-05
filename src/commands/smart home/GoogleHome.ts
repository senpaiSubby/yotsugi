/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Device } from 'google-home-notify-client'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/Command'
import { NezukoClient } from '../../NezukoClient'

export default class GoogleHome extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'say',
      category: 'Smart Home',
      description: 'Speak through Google Home',
      usage: [`say <msg>`],
      webUI: true,
      args: true
    })
  }

  // TODO add google home typings
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api) {
    // * ------------------ Setup --------------------

    const { p, Utils, Log } = client
    const { errorMessage, missingConfig, standardMessage } = Utils

    // * ------------------ Config --------------------

    const { ip, name, language } = client.db.config.googleHome

    // * ------------------ Check Config --------------------

    if (!ip || !name || !language) {
      const settings = [
        `${p}config set googleHome name <name>`,
        `${p}config set googleHome ip <ip addy>`,
        `${p}config set googleHome language <en/fr>`
      ]
      return missingConfig(msg, 'googleHome', settings)
    }

    // * ------------------ Logic --------------------

    const googleSpeak = async (speach: string) => {
      try {
        const device = new Device(ip, name, language)
        device.notify(speach)
        if (api) return `Told Google Home to say [ ${speach} ]`
        return standardMessage(msg, `Told Google Home to say [ ${speach} ]`)
      } catch (e) {
        if (api) return `Failed to connect to Google Home`
        Log.error('Google Home', 'Failed to connect to Google Home', e)
        await errorMessage(msg, `Failed to connect to Google Home`)
      }
    }

    // * ------------------ Usage Logic --------------------

    return googleSpeak(args.join(' '))
  }
}
