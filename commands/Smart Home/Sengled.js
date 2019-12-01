const fetch = require('node-fetch')
const Command = require('../../core/Command')

module.exports = class Sengled extends Command {
  constructor(client) {
    super(client, {
      name: 'lights',
      category: 'Smart Home',
      description: 'Sengled Light Control',
      usage: [`lights desk`, `lights list`],
      aliases: ['light', 'lamp', 'sengled'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { Log, Utils, p, db } = client
    const {
      missingConfig,
      warningMessage,
      errorMessage,
      standardMessage,
      capitalize,
      embed
    } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { jsessionid, username, password } = db.config.sengled

    // * ------------------ Check Config --------------------

    if (!jsessionid || !username || !password) {
      const settings = [
        `${p}db set sengled jsessionid <id>`,
        `${p}db set sengled username <user>`,
        `${p}db set sengled password <pass>`
      ]
      return missingConfig(msg, 'sengled', settings)
    }

    // * ------------------ Logic --------------------

    const baseUrl = 'https://us-elements.cloud.sengled.com:443/zigbee'
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `JSESSIONID=${jsessionid}`
    }

    // eslint-disable-next-line no-unused-vars
    const login = async () => {
      const jsonData = {
        uuid: 'xxx',
        isRemote: 'true',
        user: username,
        pwd: password,
        os_type: 'ios'
      }
      try {
        const response = await fetch(`${baseUrl}/customer/remoteLogin.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData)
        })
        const data = await response.json()
        return data
      } catch (e) {
        if (api) return `Failed to connect to Sengled`
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }

    const getDevices = async () => {
      try {
        const response = await fetch(`${baseUrl}/room/getUserRoomsDetail.json`, {
          method: 'POST',
          headers
        })
        const data = await response.json()
        const deviceList = []

        data.roomList.forEach((room) => {
          room.deviceList.forEach((device) => {
            deviceList.push({
              room: capitalize(room.roomName),
              name: capitalize(device.deviceName),
              uuid: device.deviceUuid,
              status: device.onoff === 1 ? 'on' : 'off',
              brightness: device.brightness
            })
          })
        })
        return deviceList
      } catch (e) {
        if (api) return `Failed to connect to Sengled`
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }

    const setLight = async (deviceID, deviceName, newState) => {
      try {
        const jsonData = {
          deviceUuid: deviceID,
          onoff: newState === 'off' ? 0 : 1
        }
        await fetch(`${baseUrl}/device/deviceSetOnOff.json`, {
          method: 'POST',
          headers,
          body: JSON.stringify(jsonData)
        })

        const icon = newState === 'on' ? ':full_moon:' : ':new_moon:'
        const state = newState === 'on' ? 'on' : 'off'
        if (api) return `[ ${deviceName} ] light turned [ ${state} ]`
        return standardMessage(msg, `${icon} [ ${deviceName} ] light turned [ ${state} ]`)
      } catch (e) {
        if (api) return `Failed to connect to Sengled`
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }
    const setBrightness = async (deviceUuid, deviceName, newBrightness) => {
      deviceName = capitalize(deviceName)
      newBrightness = Number(newBrightness)
      try {
        // convert 0-100 to 0-255
        const brightness = (newBrightness / 100) * 255

        const jsonData = { deviceUuid, brightness }
        const response = await fetch(`${baseUrl}/device/deviceSetBrightness.json`, {
          method: 'POST',
          headers,
          body: JSON.stringify(jsonData)
        })
        if (response.status === 200) {
          if (newBrightness === 0 || newBrightness === 100) {
            const icon = newBrightness === 100 ? ':full_moon:' : ':new_moon:'
            const newStatus = newBrightness === 100 ? 'on' : 'off'
            if (api) return `[ ${deviceName} ] light turned [ ${newStatus} ]`
            return standardMessage(msg, `${icon} [ ${deviceName} ] light turned [ ${newStatus} ]`)
          }
          if (api) return `[ ${deviceName} ] brightness set to [ ${newBrightness} ]`
          return standardMessage(
            msg,
            `:bulb: [ ${deviceName} ] brightness set to [ ${newBrightness} ]`
          )
        }
      } catch (e) {
        if (api) return `Failed to connect to Sengled`
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }

    // * ------------------ Usage Logic --------------------

    const devices = await getDevices()
    if (devices) {
      const option = args[0]
      switch (option) {
        case 'list': {
          if (api) return devices
          const e = embed('green', 'light.png').setTitle(':bulb: Sengled Lights')
          devices.forEach((device) => {
            e.addField(
              `${device.name}`,
              `Status: ${capitalize(device.status)}\n Brightness: ${device.brightness}\nID: ${
                device.uuid
              }`,
              true
            )
          })
          return channel.send(e)
        }
        default: {
          const deviceName = args[0].toLowerCase()
          // find index based of of key name
          const index = devices.findIndex((d) => d.name.toLowerCase() === deviceName)

          // if light not found
          if (index === -1) {
            if (api) return `Could not find a light named [ ${capitalize(deviceName)} ]`
            return warningMessage(msg, `Could not find a light named [ ${capitalize(deviceName)} ]`)
          }
          const device = devices[index].uuid

          if (args[1]) {
            if (args[1] === 'on' || args[1] === 'off') {
              // toggle power on/off if brightness not specified
              const newState = args[1] === 'on' ? 100 : 0
              return setBrightness(device, deviceName, newState)
            }
            // set light brightness eg: !light desk 100
            return setBrightness(device, deviceName, args[1])
          }
          // if no brightness specified then toggle light power
          const newState = devices[index].status === 'on' ? 0 : 100
          return setBrightness(device, deviceName, newState)
        }
      }
    }
  }
}
