/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { get } from 'unirest'
import urljoin from 'url-join'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

/**
 * Command to control Pioneer AVR receivers
 */
export default class PioneerAVR extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Smart Home',
      description: 'Control Pioneer AV Recievers',
      name: 'avr',
      ownerOnly: true,
      usage: [`avr vol [1-100]`, `avr [off/on]`, `avr [mute]`],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { sleep } = Utils
    const { p } = client
    const { missingConfig, warningMessage, validOptions, standardMessage, capitalize } = Utils

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { host } = config.pioneerAVR

    // * ------------------ Check Config --------------------

    if (!host) {
      const settings = [`${p}config set pioneerAVR host <http://ip>`]
      return missingConfig(msg, 'pioneerAVR', settings)
    }

    // * ------------------ Logic --------------------

    const getStatus = async () => {
      const response = await get(urljoin(host, '/StatusHandler.asp')).headers({
        accept: 'application/json'
      })

      return response.body as PioneerInfo
    }

    const getVolume = async () => {
      const stats = await getStatus()
      const currentVolume = stats.Z[0].V
      const value = (currentVolume / 185) * 100
      return Math.round(value)
    }

    const setVolume = async (newVol: number) => {
      const currentVol = await getVolume()
      if (newVol >= currentVol) {
        // Setting the volume higher
        const raiseVal = (newVol - currentVol) * 2
        for (let i = 0; i < raiseVal; i++) {
          await get(urljoin(host, '/EventHandler.asp?WebToHostItem=VU')).headers({
            accept: 'application/json'
          })
        }
      } else if (newVol <= currentVol) {
        // Setting the volume lower
        const lowerVal = Math.abs((newVol - currentVol) * 2)

        for (let i = 0; i < lowerVal; i++) {
          await get(urljoin(host, '/EventHandler.asp?WebToHostItem=VD')).headers({
            accept: 'application/json'
          })
        }
      }
    }

    const setPower = async (onoff) => {
      const state = onoff === 'on' ? 'PO' : 'PF'
      await get(urljoin(host, `/EventHandler.asp?WebToHostItem=${state}`)).headers({
        accept: 'application/json'
      })
      return standardMessage(msg, 'green', `:radio: AVR turned [ ${capitalize(onoff)} ]`)
    }

    const toggleMute = async () => {
      const status = await getStatus()
      const state = status.Z[0].M === 0 ? 'MO' : 'MF'
      await get(urljoin(host, `/EventHandler.asp?WebToHostItem=${state}`)).headers({
        accept: 'application/json'
      })
      const muteStatus = status.Z[0].M === 0 ? ':mute:' : ':speaker:'
      return standardMessage(msg, 'green', `${muteStatus} AVR [ ${muteStatus} ]`)
    }

    // * ------------------ Usage Logic --------------------

    // Use first argument as our command
    const command = args[0]
    const level = args[1]

    switch (command) {
      case 'on':
      case 'off':
        return setPower(command)

      case 'mute':
        return toggleMute()

      case 'vol': // Set volume
        // Set volume
        if (!level) {
          const currentVol = await getVolume()
          return standardMessage(msg, 'green', `:speaker: Current volume is [ ${currentVol} / 100 ]`)
        }
        if (isNaN(level)) {
          return warningMessage(msg, `Volume should be a number between 1-100`)
        }
        for (let i = 0; i < 3; i++) {
          await setVolume(level)
          await sleep(600)
        }

        return standardMessage(msg, 'green', `:speaker: Volume set to [ ${level} ]`)

      default:
        return validOptions(msg, ['on', 'off', 'vol', 'mute'])
    }
  }
}
