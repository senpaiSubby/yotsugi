const Discord = require('discord.js')
const fetch = require('node-fetch')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'lights',
    category: 'Smart Home',
    description: 'Sengled Light Control',
    usage: `${prefix}lights desk | ${prefix}lights list`,
    aliases: ['light', 'lamp']
  },
  options: {
    enabled: true,
    apiEnabled: true,
    showInHelp: true,
    ownerOnly: true,
    guildOnly: true,
    args: true,
    cooldown: 5
  },
  async execute(client, msg, args, api) {
    //* -------------------------- Setup --------------------------
    const logger = client.logger

    //* ------------------------- Config --------------------------

    const { jsessionid, username, password } = client.config.commands.sengled
    const baseUrl = 'https://us-elements.cloud.sengled.com:443/zigbee'
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `JSESSIONID=${jsessionid}`
    }

    //* ----------------------- Main Logic ------------------------

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
        logger.warn(error)
        return error
      }
    }

    const getDevices = async () => {
      try {
        const response = await fetch(`${baseUrl}/room/getUserRoomsDetail.json`, {
          method: 'POST',
          headers: headers
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
        logger.warn(error)
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
          headers: headers,
          body: JSON.stringify(jsonData)
        })
        //* const data = await response.json()
        return newState
      } catch (error) {
        logger.warn(error)
        return error
      }
    }
    const setBrightness = async (deviceID, newBrightness) => {
      try {
        //* convert 0-100 to 0-255
        const value = (newBrightness / 100) * 255

        const jsonData = {
          deviceUuid: deviceID,
          brightness: value
        }
        const response = await fetch(`${baseUrl}/device/deviceSetBrightness.json`, {
          credentials: 'include',
          method: 'POST',
          headers: headers,
          body: JSON.stringify(jsonData)
        })
        //* const data = await response.json()
        if (response.status === 200) return 'ok'
      } catch (error) {
        logger.warn(error)
        return error
      }
    }

    //* ---------------------- Usage Logic ------------------------

    const embed = new Discord.RichEmbed()
    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }

    const devices = await getDevices()

    switch (args[0]) {
      case 'list':
        if (api) return devices

        embed.setTitle(':flashlight: Lights')

        for (const device of devices) {
          embed.addField(`${device.name}`, `Status: ${device.status}\n Brightness: ${device.brightness}\nID: ${device.uuid}`)
        }
        return msg.channel.send({ embed })

      default: {
        //* find index based of of key name
        const index = devices.findIndex((d) => d.name === args[0])

        //* if light not found
        if (index === -1) {
          //* if device name doesnt exist
          if (api) return `Could not find a light named ${args[0]}`

          embed.setTitle(`:rotating_light: Could not find a light named ${args[0]}`)
          return msg.channel.send({ embed })
        } else {
          if (args[1]) {
            if (args[1] === 'on' || args[1] === 'off') {
              //* toggle power on/off if brightness not specified
              await setBrightness(devices[index].uuid, args[1] === 'on' ? '100' : '0')

              if (api) return `${args[0]} light turned ${args[1] === 'on' ? 'on' : 'off'}`

              embed.setTitle(`:flashlight: ${args[0]} light turned ${args[1] === 'on' ? 'on' : 'off'}.`)
              return msg.channel.send({ embed })
            } else {
              //* set light brightness eg: !light desk 100
              await setBrightness(devices[index].uuid, args[1])

              if (api) return `${args[0]} light brightness set to ${args[1]}`

              embed.setTitle(`:flashlight: ${args[0]} light brightness set to ${args[1]}`)
              return msg.channel.send({ embed })
            }
          } else {
            //* if no brightness specified then toggle light power

            const newState = devices[index].status === 'on' ? 'off' : 'on'

            await setLight(devices[index].uuid, newState)
            if (api) return `${args[0]} light turned ${newState}.`
            embed.setTitle(`:flashlight: ${args[0]} light turned ${newState}.`)

            return msg.channel.send({ embed })
          }
        }
      }
    }
  }
}
