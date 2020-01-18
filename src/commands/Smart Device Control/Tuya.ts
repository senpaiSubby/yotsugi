/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import TuyAPI from 'tuyapi'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class Tuya extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'tuya',
      category: 'Smart Device Control',
      description: 'Tuya device control',
      usage: [`plug <name>`],
      webUI: true,
      args: true,
      ownerOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api: boolean) {
    // * ------------------ Setup --------------------
    const { Utils, Log } = client
    const { errorMessage, warningMessage, standardMessage, asyncForEach, capitalize, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { tuyaDevices } = client.db.config

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
        if (api) return text
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
        if (api) return `[ ${name} ] turned [ ${status} ]`
        return standardMessage(msg, 'green', `:electric_plug: [ ${name} ] turned [ ${status} ]`)
      } catch (e) {
        const text = `Failed to connect to [ ${name} ]`
        if (api) return text
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
          if (api) return `[ ${name} ] is already [ ${state} ]`
          return standardMessage(msg, 'green', `:electric_plug: [ ${name} ] is already [ ${state} ]`)
        }
        await device.set({ set: !currentState })
        await device.disconnect()
        if (api) return `[ ${name} ] turned [ ${state} ]`
        return standardMessage(msg, 'green', `:electric_plug: [ ${name} ] turned [ ${state} ]`)
      } catch (e) {
        const text = `Failed to connect to [ ${name} ]`
        if (api) return text
        Log.error('Tuya', text, e)
        await errorMessage(msg, text)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        const deviceList = await listPlugs()
        if (deviceList) {
          if (api) return deviceList
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
        if (index === -1) return warningMessage(msg, `No plug named [ ${name} ]`)

        // If on/off specified
        if (args[1]) return setPlug(device, args[1])

        // If user doesnt specify on/off then toggle device instead
        return togglePlug(device)
      }
    }
  }
}
