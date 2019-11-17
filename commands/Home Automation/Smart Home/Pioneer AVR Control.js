/* eslint-disable class-methods-use-this */
const fetch = require('node-fetch')
const Discord = require('discord.js')
const urljoin = require('url-join')
const Command = require('../../../core/Command')

class PioneerAVRController extends Command {
  constructor(client) {
    super(client, {
      name: 'avr',
      category: 'Smart Home',
      description: 'Pioneer AVR Controller',
      usage: `avr vol <1-100> | avr <off/on> | avr <mute>`,
      aliases: ['vol'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { sleep } = client.utils
    const { logger } = client

    // ------------------------- Config --------------------------

    const { host } = client.config.commands.pioneerAVR

    // ----------------------- Main Logic ------------------------

    const getStatus = async () => {
      const response = await fetch(urljoin(host, '/StatusHandler.asp'))
      const data = await response.json()
      return data
    }

    const getVolume = async () => {
      const stats = await getStatus()
      const currentVolume = stats.Z[0].V
      const value = (currentVolume / 185) * 100
      return Math.round(value)
    }

    const setVolume = async (number) => {
      const currentVol = await getVolume()
      if (number >= currentVol) {
        // setting the volume higher
        const raiseVal = (number - currentVol) * 2
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < raiseVal; i++) {
          // eslint-disable-next-line no-await-in-loop
          await fetch(urljoin(host, '/EventHandler.asp?WebToHostItem=VU'))
        }
      } else if (number <= currentVol) {
        // setting the volume lower
        const lowerVal = Math.abs((number - currentVol) * 2)
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < lowerVal; i++) {
          // eslint-disable-next-line no-await-in-loop
          await fetch(urljoin(host, '/EventHandler.asp?WebToHostItem=VD'))
        }
      }
    }

    const setPower = async (onoff) => {
      const state = onoff === 'on' ? 'PO' : 'PF'
      return fetch(urljoin(host, `/EventHandler.asp?WebToHostItem=${state}`))
    }

    const toggleMute = async () => {
      const status = await getStatus()
      const state = status.Z[0].M === 0 ? 'MO' : 'MF'
      await fetch(urljoin(host, `/EventHandler.asp?WebToHostItem=${state}`))
      return status.Z[0].M === 0 ? 'muted' : 'unmuted'
    }

    // ---------------------- Usage Logic ------------------------

    // use first argument as our command
    const command = args[0]
    const level = args[1]
    const embed = new Discord.RichEmbed()
    if (!api) {
      // embed.attachFile('./data/images/icons/pioneer.png')
      // embed.setThumbnail('attachment://pioneer.png')
      embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)
    }

    switch (command) {
      case 'on': // turn avr on
        await setPower('on')

        if (api) return 'AVR turned on'

        embed.setTitle(':radio: AVR turned on')
        return msg.channel.send({ embed })

      case 'off': // turn avr off
        await setPower('off')

        if (api) return 'AVR turned off'

        embed.setTitle(':radio: AVR turned off')
        return msg.channel.send({ embed })

      case 'mute': {
        // mute/unmute avr
        const muteStatus = await toggleMute()

        if (api) return `AVR ${muteStatus}`

        embed.setTitle(`${muteStatus === 'muted' ? ':mute:' : ':speaker:'} AVR ${muteStatus}`)
        return msg.channel.send({ embed })
      }

      case 'vol': // set volume
        // set volume
        if (!level) {
          // if no volume specified send current volume
          if (api) return `Current volume is ${await getVolume()} / 100`

          embed.setTitle(`:speaker: Current volume is ${await getVolume()} / 100`)
          return msg.channel.send({ embed })
        }

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(level)) {
          // is specified volume isnt a number notify
          if (api) return '!Volume should be a number between 1-100'

          embed.setTitle(':rotating_light: !Volume should be a number between 1-100')
          return msg.channel.send({ embed })
        }
        // set volume to specified level
        // run command 3x for lack of api accuracy
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 3; i++) {
          // eslint-disable-next-line no-await-in-loop
          await setVolume(level)
          // eslint-disable-next-line no-await-in-loop
          await sleep(2000)
        }
        if (api) return `Volume set to ${level}`

        embed.setTitle(`:speaker: Volume set to ${level}`)
        return msg.channel.send({ embed })

      default:
        break
    }
  }
}
module.exports = PioneerAVRController
