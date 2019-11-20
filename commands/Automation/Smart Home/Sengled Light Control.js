const fetch = require('node-fetch')
const Command = require('../../../core/Command')

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
    const { Log, Utils, colors } = client
    const { channel } = msg
    // ------------------------- Config --------------------------

    const { jsessionid, username, password } = JSON.parse(client.settings.sengled)
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
        return error
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

    const embed = Utils.embed(msg)

    const devices = await getDevices()

    switch (args[0]) {
      case 'list':
        if (api) return devices

        embed.setTitle(':flashlight: Lights')

        for (const device of devices) {
          embed.addField(
            `${device.name}`,
            `Status: ${device.status}\n Brightness: ${device.brightness}\nID: ${device.uuid}`
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
          embed.setColor(colors.yellow)
          embed.setTitle(`:rotating_light: Could not find a light named ${args[0]}`)
          return channel.send({ embed })
        }
        if (args[1]) {
          if (args[1] === 'on' || args[1] === 'off') {
            // toggle power on/off if brightness not specified
            await setBrightness(devices[index].uuid, args[1] === 'on' ? '100' : '0')

            if (api) return `${args[0]} light turned ${args[1] === 'on' ? 'on' : 'off'}`

            embed.setTitle(
              `:flashlight: ${args[0]} light turned ${args[1] === 'on' ? 'on' : 'off'}.`
            )
            return channel.send({ embed })
          }
          // set light brightness eg: !light desk 100
          await setBrightness(devices[index].uuid, args[1])

          if (api) return `${args[0]} light brightness set to ${args[1]}`

          embed.setTitle(`:flashlight: ${args[0]} light brightness set to ${args[1]}`)
          return channel.send({ embed })
        }
        // if no brightness specified then toggle light power

        const newState = devices[index].status === 'on' ? 'off' : 'on'

        await setLight(devices[index].uuid, newState)
        if (api) return `${args[0]} light turned ${newState}.`
        embed.setTitle(`:flashlight: ${args[0]} light turned ${newState}.`)

        return channel.send({ embed })
      }
    }
  }
}
module.exports = SengledLightController
