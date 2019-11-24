const { Device } = require('google-home-notify-client')
const Command = require('../../core/Command')

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
    const { p, Log, Utils } = client
    const { errorMessage, missingConfig, standardMessage } = Utils
    // ------------------------- Config --------------------------

    const { ip, name, language } = JSON.parse(client.settings.googleHome)

    if (!ip || !name || !language) {
      const settings = [
        `${p}db set googleHome name <name>`,
        `${p}db set googleHome ip <ip addy>`,
        `${p}db set googleHome language <en/fr>`
      ]
      return missingConfig(msg, 'googleHome', settings)
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

    if (status === 'success') {
      if (api) return `Told Google Home to say: ${command}`
      return standardMessage(msg, `Told Google Home to say: ${command}`)
    }
    if (api) return 'No connection to Google Home.'
    return errorMessage(msg, `No connection to Google Home`)
  }
}
module.exports = GoogleHomeSpeak
