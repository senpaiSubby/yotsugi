/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import TuyAPI from 'tuyapi'
import { GeneralDBConfig, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to control Tuya smart plugs and lights
 */
export default class Tuya extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['plug'],
      args: true,
      category: 'Smart Home',
      description: 'Control Tuya smart plugs and devices',
      name: 'tuya',
      ownerOnly: true,
      usage: [`tuya [device name]`],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { errorMessage, warningMessage, standardMessage, asyncForEach, capitalize, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { tuyaDevices } = config

    // * ------------------ Logic --------------------

    const listPlugs = async () => {
      try {
        const deviceList = []

        await asyncForEach(tuyaDevices, async (d) => {
          const device = new TuyAPI({ id: d.id, key: d.key })

          await device.find()

          await device.connect()

          const currentStatus = await device.get()
          deviceList.push({
            name: capitalize(d.name),
            status: currentStatus === 1 ? 'on' : 'off'
          })
          await device.disconnect()
        })

        return deviceList
      } catch (e) {
        const text = `Failed to collect device list`
        Log.error('Tuya', text, e)
        await errorMessage(msg, text)
      }
    }

    const togglePlug = async (d) => {
      const { id, key } = d
      let { name } = d
      name = capitalize(name)

      try {
        const device = new TuyAPI({ id, key })

        await device.find()
        await device.connect()

        const currentStatus = await device.get()
        await device.set({ set: !currentStatus })
        await device.disconnect()

        const status = currentStatus ? 'Off' : 'On'
        return standardMessage(msg, 'green', `:electric_plug: [ ${name} ] turned [ ${status} ]`)
      } catch (e) {
        const text = `Failed to connect to [ ${name} ]`
        Log.error('Tuya', text, e)
        await errorMessage(msg, text)
      }
    }

    const setPlug = async (d, state) => {
      const { id, key } = d
      let { name } = d
      name = capitalize(name)

      try {
        const device = new TuyAPI({ id, key })
        await device.find()
        await device.connect()
        const currentState = await device.get()
        const newState = state === 'on'
        state = capitalize(state)

        if (currentState === newState) {
          await device.disconnect()
          return standardMessage(msg, 'green', `:electric_plug: [ ${name} ] is already [ ${state} ]`)
        }
        await device.set({ set: !currentState })
        await device.disconnect()
        return standardMessage(msg, 'green', `:electric_plug: [ ${name} ] turned [ ${state} ]`)
      } catch (e) {
        const text = `Failed to connect to [ ${name} ]`
        Log.error('Tuya', text, e)
        await errorMessage(msg, text)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        const deviceList = await listPlugs()
        if (deviceList) {
          const e = embed(msg, 'green', 'plug.png').setTitle(':electric_plug: Tuya Smart Plugs')
          if (typeof deviceList !== 'string') {
            deviceList.forEach((device) => e.addField(`${device.name}`, `Status: [ ${capitalize(device.status)} ]`))
          }
          return channel.send(e)
        }
        return
      }
      default: {
        const deviceName = args[0].toLowerCase()
        const index = tuyaDevices.findIndex((d) => d.name.toLowerCase() === deviceName)
        const device = tuyaDevices[index]
        const name = capitalize(args[0])
        // If plug name not found
        if (index === -1) {
          return warningMessage(msg, `No plug named [ ${name} ]`)
        }

        // If on/off specified
        if (args[1]) return setPlug(device, args[1])

        // If user doesnt specify on/off then toggle device instead
        return togglePlug(device)
      }
    }
  }
}
