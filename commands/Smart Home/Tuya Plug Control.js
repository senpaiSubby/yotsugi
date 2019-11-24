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
    // -------------------------- Setup --------------------------
    const { Log, Utils } = client
    const { errorMessage, warningMessage, standardMessage } = Utils
    const { channel } = msg
    // ------------------------- Config --------------------------

    const devices = JSON.parse(client.db.general.tuyaPlugControl)

    // ----------------------- Main Logic ------------------------

    /**
     * List info from plugs specify in config
     * @return {Object} array of devices
     */
    const listPlugs = async () => {
      try {
        const deviceList = []

        for (const item of devices) {
          const device = new TuyAPI({
            id: item.id,
            key: item.key
          })

          await device.find()

          await device.connect()

          const currentStatus = await device.get()
          deviceList.push({
            name: item.name,
            status: currentStatus === 1 ? 'on' : 'off'
          })
          device.disconnect()
        }
        return deviceList
      } catch (error) {
        Log.warn(error)
        return error
      }
    }

    /**
     * Toggle plug on/off
     * @param {Number} id ID of plug
     * @param {Number} key Key of plug
     * @return {String} new status of plug. on/off
     */
    const togglePlug = async (id, key) => {
      try {
        const device = new TuyAPI({
          id,
          key
        })
        await device.find()
        await device.connect()
        const currentStatus = await device.get()
        await device.set({ set: !currentStatus })
        device.disconnect()
        return currentStatus ? 'off' : 'on'
      } catch (error) {
        Log.warn(error)
        return error
      }
    }

    /**
     * Set new status for plug
     * @param {Number} id ID of plug
     * @param {Number} key Key of plug
     * @param {String} state new state. on/off
     * @return {String} new status of plug. on/off
     */
    const setPlug = async (id, key, state) => {
      try {
        const device = new TuyAPI({
          id,
          key
        })
        await device.find()
        await device.connect()
        const currentState = await device.get()
        const newState = state === 'on'
        // if state same and new state return state
        if (currentState === newState) {
          device.disconnect()
          return `already ${state}`
        }
        await device.set({ set: !currentState })
        device.disconnect()
        return state
      } catch (error) {
        Log.warn(error)
        return error
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg, 'green')

    switch (args[0]) {
      case 'list': {
        // if user wants list of devices
        const deviceList = await listPlugs()

        if (api) return deviceList

        embed.setTitle(':electric_plug: Smart Plugs')

        for (const device of deviceList) {
          embed.addField(`${device.name}`, `Status: ${device.status}`)
        }
        return channel.send({ embed })
      }

      default: {
        // get index of device from name sepcified
        const index = devices.findIndex((d) => d.name === args[0])
        // if plug name not found
        if (index === -1) {
          if (api) return `No plug named ${args[0]}.`
          return warningMessage(msg, `No plug named **${Utils.capitalize(args[0])}`)
        }

        if (args[1]) {
          // if on/off specified
          const status = await setPlug(devices[index].id, devices[index].key, args[1])

          if (status !== 'on' && status !== 'off') {
            if (api) return `${args[0]} is ${status}`

            return standardMessage(msg, `:electric_plug: ${Utils.capitalize(args[0])} is ${status}`)
          }
          if (api) return `${args[0]} turned ${status}.`

          return standardMessage(
            msg,
            `:electric_plug: ${Utils.capitalize(args[0])} turned ${status}.`
          )
        }
        // if user doesnt specify on/off then toggle device instead
        const status = await togglePlug(devices[index].id, devices[index].key)

        if (api) return `${args[0]} turned ${status}`

        return standardMessage(msg, `:electric_plug: ${Utils.capitalize(args[0])} turned ${status}`)
      }
    }
  }
}

module.exports = TuyaPlugController
