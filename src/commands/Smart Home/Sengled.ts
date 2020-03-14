/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { post } from 'unirest'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to control Sengled smart lights and devices
 */
export default class Sengled extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['lamp'],
      args: true,
      category: 'Smart Home',
      description: 'Control Sengled smart lights',
      name: 'sengled',
      ownerOnly: true,
      usage: [`sengled [light name]`, `sengled list`],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { p } = client
    const { missingConfig, warningMessage, errorMessage, standardMessage, capitalize, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig

    const { username, password } = config.sengled
    const { jsessionid } = config.sengled

    // * ------------------ Check Config --------------------

    if (!username || !password) {
      const settings = [`${p}config set sengled username <user>`, `${p}config set sengled password <pass>`]
      return missingConfig(msg, 'sengled', settings)
    }

    // * ------------------ Logic --------------------

    const baseUrl = 'https://us-elements.cloud.sengled.com:443/zigbee'
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `JSESSIONID=${jsessionid}`
    }

    // TODO add sengled login typings
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

        const data = response.body
        return data.jsessionid
      } catch (e) {
        Log.warn('Sengled', 'Failed to connect to Sengled')
      }
    }

    if (!jsessionid) {
      config.sengled.jsessionid = await login()

      await db.update({ config: JSON.stringify(config) })
    }

    const getDevices = async () => {
      try {
        const response = await post(`${baseUrl}/room/getUserRoomsDetail.json`).headers(headers)

        const data = response.body as SengledDevices

        interface DeviceList {
          room: string
          name: string
          uuid: string
          status: string
          brightness: number
        }

        const deviceList: DeviceList[] = []

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
        // If (api) return `Failed to connect to Sengled`
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }

    // Eslint-disable-next-line no-unused-vars
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
        return standardMessage(msg, 'green', `${icon} [ ${deviceName} ] light turned [ ${state} ]`)
      } catch (e) {
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }
    const setBrightness = async (deviceUuid, deviceName, newBrightness) => {
      deviceName = capitalize(deviceName)
      newBrightness = Number(newBrightness)
      try {
        // Convert 0-100 to 0-255
        const brightness = (newBrightness / 100) * 255

        const response = await post(`${baseUrl}/device/deviceSetBrightness.json`)
          .headers(headers)
          .send({ deviceUuid, brightness })

        if (response.status === 200) {
          if (newBrightness === 0 || newBrightness === 100) {
            const icon = newBrightness === 100 ? ':full_moon:' : ':new_moon:'
            const newStatus = newBrightness === 100 ? 'on' : 'off'

            return standardMessage(msg, 'green', `${icon} [ ${deviceName} ] light turned [ ${capitalize(newStatus)} ]`)
          }

          return standardMessage(msg, 'green', `:bulb: [ ${deviceName} ] brightness set to [ ${newBrightness} ]`)
        }
      } catch (e) {
        Log.error('Sengled', 'Failed to connect to Sengled', e)
        await errorMessage(msg, `Failed to connect to Sengled`)
      }
    }

    // * ------------------ Usage Logic --------------------

    const devices = await getDevices()

    if (devices) {
      switch (args[0]) {
        case 'id': {
          const x = await login()

          return standardMessage(msg, 'green', `${x.jsessionid}`)
        }

        case 'list': {
          const e = embed(msg, 'green', 'light.png').setTitle(':bulb: Sengled Lights')
          if (typeof devices !== 'string') {
            devices.forEach((device) => {
              e.addField(
                `${device.name}`,
                `Status: ${capitalize(device.status)}\n Brightness: ${device.brightness}\nID: ${device.uuid}`,
                true
              )
            })
          }
          return channel.send(e)
        }
        default: {
          const deviceName = args[0].toLowerCase()
          // Find index based of of key name
          let index: number
          if (typeof devices !== 'string') {
            index = devices.findIndex((d) => d.name.toLowerCase() === deviceName)
          }
          // If light not found
          if (index === -1) {
            return warningMessage(msg, `Could not find a light named [ ${capitalize(deviceName)} ]`)
          }
          const device = devices[index].uuid

          if (args[1]) {
            if (args[1] === 'on' || args[1] === 'off') {
              // Toggle power on/off if brightness not specified
              // tslint:disable-next-line:no-shadowed-variable
              const newState = args[1] === 'on' ? 100 : 0
              return setBrightness(device, deviceName, newState)
            }
            // Set light brightness eg: !light desk 100
            return setBrightness(device, deviceName, args[1])
          }
          // If no brightness specified then toggle light power
          const newState = devices[index].status === 'on' ? 0 : 100
          return setBrightness(device, deviceName, newState)
        }
      }
    }
  }
}
