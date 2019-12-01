const TuyAPI = require('tuyapi')
const Command = require('../../core/Command')

module.exports = class Tuya extends Command {
  constructor(client) {
    super(client, {
      name: 'plug',
      category: 'Smart Home',
      description: 'Tuya Plug Control',
      usage: [`plug <name>`],
      aliases: ['socket', 'tuya'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
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
        return standardMessage(msg, `:electric_plug: [ ${name} ] turned [ ${status} ]`)
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
          return standardMessage(msg, `:electric_plug: [ ${name} ] is already [ ${state} ]`)
        }
        await device.set({ set: !currentState })
        await device.disconnect()
        if (api) return `[ ${name} ] turned [ ${state} ]`
        return standardMessage(msg, `:electric_plug: [ ${name} ] turned [ ${state} ]`)
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
          const e = embed('green', 'plug.png').setTitle(':electric_plug: Tuya Smart Plugs')

          deviceList.forEach((device) =>
            e.addField(`${device.name}`, `Status: [ ${capitalize(device.status)} ]`)
          )
          return channel.send(e)
        }
        return
      }
      default: {
        const deviceName = args[0].toLowerCase()
        const index = tuyaDevices.findIndex((d) => d.name.toLowerCase() === deviceName)
        const device = tuyaDevices[index]
        const name = capitalize(args[0])
        // if plug name not found
        if (index === -1) return warningMessage(msg, `No plug named [ ${name} ]`)

        // if on/off specified
        if (args[1]) return setPlug(device, args[1])

        // if user doesnt specify on/off then toggle device instead
        return togglePlug(device)
      }
    }
  }
}
