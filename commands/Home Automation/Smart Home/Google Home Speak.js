
const { Device } = require('google-home-notify-client')
const Discord = require('discord.js')
const Command = require('../../../core/Command')

class GoogleHomeSpeak extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      category: 'Smart Home',
      description: 'Speak through Google Home',
      usage: `say <msg>`,
      aliases: ['speak'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // -------------------------- Setup --------------------------
    const { Log } = client

    // ------------------------- Config --------------------------

    const { ip, name, language, accent } = client.config.commands.googleHome

    // ----------------------- Main Logic ------------------------

    /**
     * send text to Google Home to TTS
     * @param {String} speach text to have spoken
     * @returns {String} success / no connection
     */
    const googleSpeak = async (speach) => {
      try {
        const device = new Device(ip, name, language, accent)
        await device.notify(speach)
        return 'success'
      } catch (error) {
        Log.warn(error)
        return 'no connection'
      }
    }

    // ---------------------- Usage Logic ------------------------

    const command = args.join(' ')
    const status = await googleSpeak(command)
    const embed = new Discord.RichEmbed()

    if (!api) embed.setFooter(`Requested by: ${msg.author.username}`, msg.author.avatarURL)

    if (status === 'success') {
      if (api) return `Told Google Home to say: ${command}`
      embed.setTitle(`Told Google Home to say: **${command}**`)
      return msg.channel.send({ embed })
    }
    if (api) return 'No connection to Google Home.'
    embed.setTitle('No connection to Google Home.')
    return msg.channel.send({ embed })
  }
}
module.exports = GoogleHomeSpeak
