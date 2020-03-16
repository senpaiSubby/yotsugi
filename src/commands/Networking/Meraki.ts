/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { GeneralDBConfig, NezukoMessage } from 'typings'
import { get } from 'unirest'
import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to get information from your Meraki network devices
 */
export default class Meraki extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Networking',
      description: 'Get network information for Meraki Devices',
      name: 'meraki',
      ownerOnly: true,
      usage: ['meraki list'],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[], api) {
    // * ------------------ Setup --------------------

    const { bytesToSize, sortByKey } = Utils
    const { p } = client
    const { errorMessage, validOptions, missingConfig, embed, paginate } = Utils

    // * ------------------ Config --------------------
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { serialNum, apiKey } = config.meraki

    // * ------------------ Check Config --------------------

    if (!serialNum || !apiKey) {
      const settings = [`${p}config set meraki serialNum <serial>`, `${p}config set meraki apiKey <APIKEY>`]
      return missingConfig(msg, 'meraki', settings)
    }

    // * ------------------ Logic --------------------

    const networkDevices = async () => {
      try {
        // General network devices
        const url = `https://n263.meraki.com/api/v0/devices/${serialNum}/clients?timespan=86400`
        const response = await get(url).headers({
          'X-Cisco-Meraki-API-Key': apiKey,
          accept: 'application/json'
        })

        const devices = response.body as MerakiDevice[]
        let sent = 0 // Total send data counter
        let recv = 0 // Total recv data counter

        if (devices) {
          // If we have a connection to the meraki API
          const deviceList = []

          devices.forEach((device) => {
            // Gather / format json for each device in network
            let description: string
            if (device.description) {
              description = device.description
            } // If no device description set use hostname instead
            else description = device.dhcpHostname

            // General device info
            const { ip, vlan, mac } = device
            // Convert kb to B and get readable size
            const uploaded = bytesToSize(device.usage.recv * 1000)
            const downloaded = bytesToSize(device.usage.sent * 1000)
            sent += device.usage.recv
            recv += device.usage.sent
            // New device json
            deviceList.push({
              ip,
              mac,
              vlan,
              name: description,
              sent: uploaded,
              recv: downloaded
            })
          })
          return {
            numDevices: deviceList.length,
            traffic: { sent: bytesToSize(sent * 1000), recv: bytesToSize(recv * 1000) },
            devices: sortByKey(deviceList, '-ip')
          }
        }
      } catch (e) {
        Log.error('Meraki', 'Failed to connect to Meraki', e)
        await errorMessage(msg, 'Failed to connect to Meraki')
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        const status = await networkDevices()
        if (status && typeof status !== 'string') {
          const embedList = []
          status.devices.forEach((i) => {
            embedList.push(
              embed(msg, 'green', 'cisco.png')
                .setTitle('Meraki Devices')
                .addField('Name', i.name, true)
                .addField('IP', i.ip, true)
                .addField('VLAN', i.vlan, true)
                .addField('MAC', i.mac, true)
                .addField('Sent', i.sent, true)
                .addField('Recv', i.recv, true)
            )
          })
          return paginate(msg, embedList)
        }
        return
      }
      default:
        return validOptions(msg, ['list'])
    }
  }
}
