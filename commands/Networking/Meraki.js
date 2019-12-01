const fetch = require('node-fetch')
const Command = require('../../core/Command')

module.exports = class Meraki extends Command {
  constructor(client) {
    super(client, {
      name: 'meraki',
      category: 'Networking',
      description: 'Meraki network statistics',
      usage: [`meraki list`],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { bytesToSize, sortByKey } = client.Utils
    const { p, Utils, Log } = client
    const { errorMessage, validOptions, missingConfig, embed, paginate } = Utils

    // * ------------------ Config --------------------

    const { serielNum, apiKey } = client.db.config.meraki

    // * ------------------ Check Config --------------------

    if (!serielNum || !apiKey) {
      const settings = [`${p}db set meraki serielNum <SERIEL>`, `${p}db set meraki apiKey <APIKEY>`]
      return missingConfig(msg, 'meraki', settings)
    }

    // * ------------------ Logic --------------------

    const networkDevices = async () => {
      try {
        // general network devices
        const url = `https://n263.meraki.com/api/v0/devices/${serielNum}/clients?timespan=86400`
        const response = await fetch(url, { headers: { 'X-Cisco-Meraki-API-Key': apiKey } })
        const devices = await response.json()
        let sent = 0 // total send data counter
        let recv = 0 // total recv data counter

        if (devices) {
          // if we have a connection to the meraki API
          const deviceList = []

          devices.forEach((device) => {
            // gather / format json for each device in network
            let description
            if (device.description) description = device.description
            // if no device description set use hostname instead
            else description = device.dhcpHostname

            // general device info
            const { ip, vlan, mac } = device
            const uploaded = bytesToSize(device.usage.recv * 1000) // convert kb to B and get true size
            const downloaded = bytesToSize(device.usage.sent * 1000) // convert kb to B and get true size
            sent += device.usage.recv
            recv += device.usage.sent
            // new device json
            deviceList.push({
              name: description,
              ip,
              mac,
              vlan,
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
        if (api) return `Failed to connect to Meraki`
        Log.error('Meraki', 'Failed to connect to Meraki', e)
        await errorMessage(msg, `Failed to connect to Meraki`)
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        const status = await networkDevices()
        if (status) {
          const embedList = []
          status.devices.forEach((i) => {
            embedList.push(
              embed('green')
                .setTitle('Meraki Devices')
                .setThumbnail(
                  'https://pmcvariety.files.wordpress.com/2015/10/cisco-logo1.jpg?w=1000'
                )
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
