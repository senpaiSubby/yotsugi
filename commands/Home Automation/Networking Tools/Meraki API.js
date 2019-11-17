/* eslint-disable class-methods-use-this */
const Discord = require('discord.js')
const fetch = require('node-fetch')
const Command = require('../../../core/Command')

class MerakiAPI extends Command {
  constructor(client) {
    super(client, {
      name: 'meraki',
      category: 'Networking Tools',
      description: 'Meraki network statistics',
      usage: `meraki list`,
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { bytesToSize, addSpace, sortByKey } = client.utils
    const { logger } = client

    // ------------------------- Config --------------------------

    const { serielNum, apiKey } = client.config.commands.meraki

    // ----------------------- Main Logic ------------------------

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

          for (const device of devices) {
            // gather / format json for each device in network
            let description
            if (device.description) {
              // if device has a description set
              description = device.description
            } else {
              // if no device description set use hostname instead
              description = device.dhcpHostname
            }
            // general device info
            const { ip } = device
            const { vlan } = device
            const uploaded = bytesToSize(device.usage.recv * 1000) // convert kb to B and get true size
            const downloaded = bytesToSize(device.usage.sent * 1000) // convert kb to B and get true size
            sent += device.usage.recv
            recv += device.usage.sent
            // new device json
            const stats = {
              name: description,
              ip,
              vlan,
              sent: uploaded,
              recv: downloaded
            }
            deviceList.push(stats) // add stats per device to main deviceList
          }
          const numDevices = deviceList.length // count number of devices on network
          // generate main JSON array
          return {
            numDevices,
            traffic: { sent: bytesToSize(sent * 1000), recv: bytesToSize(recv * 1000) },
            devices: sortByKey(deviceList, 'ip')
          }
        }
      } catch (error) {
        logger.warn(error)
        return 'failure'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const embed = new Discord.RichEmbed()

    if (!api) {
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }
    switch (args[0]) {
      case 'list': {
        const status = await networkDevices()

        switch (status) {
          case 'failure':
            if (api) return 'Failure connection to Meraki API'

            embed.setTitle('Failure connection to Meraki API')
            msg.channel.send('Failure connection to Meraki API')
            break
          default: {
            if (api) return status

            for (const item of status.devices) {
              embed.addField(
                `**== ${item.name} ==**`,
                `**IP:** ${addSpace(5)} ${item.ip}\n**Sent:** ${item.sent}\n**Recv:** ${item.recv}`,
                true
              )
            }
            return msg.channel.send({ embed })
          }
        }
        break
      }
      default:
        break
    }
  }
}

module.exports = MerakiAPI
