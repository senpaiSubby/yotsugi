const { post } = require('unirest')
const Command = require('../../core/Command')

module.exports = class Sengled extends Command {
  constructor(client) {
    super(client, {
      name: 'lights',
      category: 'Smart Home',
      description: 'Sengled light control',
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
        `${p}config set sengled jsessionid <id>`,
        `${p}config set sengled username <user>`,
        `${p}config set sengled password <pass>`
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
      try {
        const response = await post(`${baseUrl}/customer/remoteLogin.json`)
          .headers({ 'Content-Type': 'application/json' })
          .send({
            uuid: 'xxx',
            isRemote: 'true',
            user: username,
            pwd: password,
            os_type: 'ios'
          })

        const data = await response.body
        return data
      } catch (e) {
        if (api) return `Failed to connect to Sengled`
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }

    const getDevices = async () => {
      try {
        const response = await post(`${baseUrl}/room/getUserRoomsDetail.json`).headers(headers)
        const data = await response.body
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
        await post(`${baseUrl}/device/deviceSetOnOff.json`)
          .headers(headers)
          .send({
            deviceUuid: deviceID,
            onoff: newState === 'off' ? 0 : 1
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

        const response = await post(`${baseUrl}/device/deviceSetBrightness.json`)
          .headers(headers)
          .send({ deviceUuid, brightness })

        if (response.status === 200) {
          if (newBrightness === 0 || newBrightness === 100) {
            const icon = newBrightness === 100 ? ':full_moon:' : ':new_moon:'
            const newStatus = newBrightness === 100 ? 'on' : 'off'
            if (api) return `[ ${deviceName} ] light turned [ ${capitalize(newStatus)} ]`
            return standardMessage(
              msg,
              `${icon} [ ${deviceName} ] light turned [ ${capitalize(newStatus)} ]`
            )
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
