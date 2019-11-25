const TuyAPI = require('tuyapi')
const Command = require('../../core/Command')

class TuyaPlugController extends Command {
  constructor(client) {
    super(client, {
      name: 'plug',
      category: 'Smart Home',
      description: 'Tuya Plug Control',
      usage: `plug <name>`,
      aliases: ['socket'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { capitalize } = Utils
    const { errorMessage, warningMessage, standardMessage } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const devices = JSON.parse(client.db.general.tuyaPlugControl)

    // * ------------------ Logic --------------------

    const listPlugs = async () => {
      try {
        const deviceList = []

        devices.forEach(async (d) => {
          const device = new TuyAPI({ id: d.id, key: d.key })

          await device.find()

          await device.connect()

          const currentStatus = await device.get()
          deviceList.push({
            name: item.name,
            status: currentStatus === 1 ? 'on' : 'off'
          })
          await device.disconnect()
        })

        return deviceList
      } catch {
        return null
      }
    }

    const togglePlug = async (d) => {
      const { name, id, key } = d
      try {
        const device = new TuyAPI({ id, key })

        await device.find()
        await device.connect()

        const currentStatus = await device.get()
        await device.set({ set: !currentStatus })
        await device.disconnect()

        const status = currentStatus ? 'off' : 'on'
        if (api) return `${capitalize(name)} turned ${status}`
        return standardMessage(msg, `:electric_plug: ${capitalize(name)} turned ${status}`)
      } catch {
        if (api) return `Failed to connect to ${capitalize(name)}`
        return errorMessage(msg, `Failed to connect to ${capitalize(name)}`)
      }
    }

    const setPlug = async (d, state) => {
      const { id, key, name } = d
      try {
        const device = new TuyAPI({ id, key })
        await device.find()
        await device.connect()
        const currentState = await device.get()
        await device.disconnect()
        const newState = state === 'on'

        if (currentState === newState) {
          if (api) return `${capitalize(name)} is already ${state}`
          return standardMessage(msg, `:electric_plug: ${capitalize(name)} is already ${state}`)
        }
        await device.set({ set: !currentState })
        if (api) return `${capitalize(name)} turned ${state}`
        return standardMessage(msg, `:electric_plug: ${capitalize(name)} turned ${state}`)
      } catch {
        if (api) return `Failed to connect to ${capitalize(name)}`
        return errorMessage(msg, `Failed to connect to ${capitalize(name)}`)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list':
        const deviceList = await listPlugs()
        if (api) return deviceList
        const embed = Utils.embed(msg).setTitle(':electric_plug: Smart Plugs')

        deviceList.forEach((device) => embed.addField(`${device.name}`, `Status: ${device.status}`))
        return channel.send(embed)

      default:
        const index = devices.findIndex((d) => d.name === args[0])
        const device = devices[index]
        const name = Utils.capitalize(args[0])
        // if plug name not found
        if (index === -1) return warningMessage(msg, `No plug named **${name}`)

        // if on/off specified
        if (args[1]) return setPlug(device, args[1])

        // if user doesnt specify on/off then toggle device instead
        return togglePlug(device)
    }
  }
}

module.exports = TuyaPlugController
