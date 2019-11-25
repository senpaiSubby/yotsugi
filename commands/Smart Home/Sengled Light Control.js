const fetch = require('node-fetch')
const Command = require('../../core/Command')

class SengledLightController extends Command {
  constructor(client) {
    super(client, {
      name: 'lights',
      category: 'Smart Home',
      description: 'Sengled Light Control',
      usage: `lights desk | lights list`,
      aliases: ['light', 'lamp'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { Log, Utils, p } = client
    const { missingConfig, warningMessage, standardMessage } = Utils
    const { channel } = msg
    // ------------------------- Config --------------------------

    const { jsessionid, username, password } = JSON.parse(client.db.general.sengled)

    if (!jsessionid || !username || !password) {
      const settings = [
        `${p}db set sengled jsessionid <id>`,
        `${p}db set sengled username <user>`,
        `${p}db set sengled password <pass>`
      ]
      return missingConfig(msg, 'sengled', settings)
    }

    const baseUrl = 'https://us-elements.cloud.sengled.com:443/zigbee'
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `JSESSIONID=${jsessionid}`
    }

    // ----------------------- Main Logic ------------------------

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
      } catch (error) {
        Log.warn(error)
        return false
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

        for (const room of data.roomList) {
          for (const device of room.deviceList) {
            deviceList.push({
              room: room.roomName,
              name: device.deviceName,
              uuid: device.deviceUuid,
              status: device.onoff === 1 ? 'on' : 'off',
              brightness: device.brightness
            })
          }
        }
        return deviceList
      } catch (error) {
        Log.warn(error)
        return error
      }
    }

    const setLight = async (deviceID, newState) => {
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
        // const data = await response.json()
        return newState
      } catch (error) {
        Log.warn(error)
        return error
      }
    }
    const setBrightness = async (deviceID, newBrightness) => {
      try {
        // convert 0-100 to 0-255
        const value = (newBrightness / 100) * 255

        const jsonData = {
          deviceUuid: deviceID,
          brightness: value
        }
        const response = await fetch(`${baseUrl}/device/deviceSetBrightness.json`, {
          credentials: 'include',
          method: 'POST',
          headers,
          body: JSON.stringify(jsonData)
        })
        // const data = await response.json()
        if (response.status === 200) return 'ok'
      } catch (error) {
        Log.warn(error)
        return error
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = Utils.embed(msg, 'green')

    const devices = await getDevices()

    switch (args[0]) {
      case 'list':
        if (api) return devices

        embed.setTitle(':bulb: Lights')

        for (const device of devices) {
          embed.addField(
            `${device.name}`,
            `Status: ${device.status}\n Brightness: ${device.brightness}\nID: ${device.uuid}`,
            true
          )
        }
        return channel.send({ embed })

      default: {
        // find index based of of key name
        const index = devices.findIndex((d) => d.name === args[0])

        // if light not found
        if (index === -1) {
          // if device name doesnt exist
          if (api) return `Could not find a light named ${args[0]}`
          return warningMessage(msg, `Could not find a light named ${args[0]}`)
        }
        if (args[1]) {
          if (args[1] === 'on' || args[1] === 'off') {
            // toggle power on/off if brightness not specified
            await setBrightness(devices[index].uuid, args[1] === 'on' ? '100' : '0')

            if (api) return `${args[0]} light turned ${args[1] === 'on' ? 'on' : 'off'}`

            return standardMessage(
              msg,
              `${args[1] === 'on' ? ':full_moon:' : ':new_moon:'} ${args[0]} light turned ${
                args[1] === 'on' ? 'on' : 'off'
              }`
            )
          }
          // set light brightness eg: !light desk 100
          await setBrightness(devices[index].uuid, args[1])

          if (api) return `${args[0]} light brightness set to ${args[1]}`

          return standardMessage(
            msg,
            `:bulb: ${Utils.capitalize(args[0])} light brightness set to ${args[1]}`
          )
        }
        // if no brightness specified then toggle light power

        const newState = devices[index].status === 'on' ? 'off' : 'on'

        await setLight(devices[index].uuid, newState)
        if (api) return `${args[0]} light turned ${newState}`
        return standardMessage(
          msg,
          `${newState === 'on' ? ':full_moon:' : ':new_moon:'} ${Utils.capitalize(
            args[0]
          )} light turned ${newState}`
        )
      }
    }
  }
}
module.exports = SengledLightController
