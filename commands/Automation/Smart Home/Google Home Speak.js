const { Device } = require('google-home-notify-client')
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
    const { p, Log, Utils, colors } = client
    const { channel } = msg
    // ------------------------- Config --------------------------

    const { ip, name, language } = JSON.parse(client.settings.googleHome)

    if (!ip || !name || !language) {
      const settings = [
        `${p}db set googleHome name <name>`,
        `${p}db set googleHome ip <ip addy>`,
        `${p}db set googleHome language <en/fr>`
      ]
      return channel.send(
        Utils.embed(msg, 'red')
          .setTitle(':gear: Missing Google Home DB config!')
          .setDescription(
            `**${p}db get googleHome** for current config.\n\nSet them like so..\n\`\`\`css\n${settings.join(
              '\n'
            )}\n\`\`\``
          )
      )
    }

    // ----------------------- Main Logic ------------------------

    /**
     * send text to Google Home to TTS
     * @param {String} speach text to have spoken
     * @returns {String} success / no connection
     */
    const googleSpeak = async (speach) => {
      try {
        const device = new Device(ip, name, language)
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
    const embed = Utils.embed(msg, 'green')

    if (status === 'success') {
      if (api) return `Told Google Home to say: ${command}`
      embed.setDescription(`**Told Google Home to say: **${command}****`)
      return channel.send({ embed })
    }
    if (api) return 'No connection to Google Home.'
    embed.setColor(colors.red)
    embed.setDescription('**No connection to Google Home.**')
    return channel.send({ embed })
  }
}
module.exports = GoogleHomeSpeak
