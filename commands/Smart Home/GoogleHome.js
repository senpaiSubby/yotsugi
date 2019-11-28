const { Device } = require('google-home-notify-client')
const Command = require('../../core/Command')

module.exports = class GoogleHome extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      category: 'Smart Home',
      description: 'Speak through Google Home',
      usage: [`say <msg>`],
      aliases: ['speak'],
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { p, Utils, Log } = client
    const { errorMessage, missingConfig, standardMessage } = Utils

    // * ------------------ Config --------------------

    const { ip, name, language } = client.db.config.googleHome

    // * ------------------ Check Config --------------------

    if (!ip || !name || !language) {
      const settings = [
        `${p}db set googleHome name <name>`,
        `${p}db set googleHome ip <ip addy>`,
        `${p}db set googleHome language <en/fr>`
      ]
      return missingConfig(msg, 'googleHome', settings)
    }

    // * ------------------ Logic --------------------

    const googleSpeak = async (speach) => {
      try {
        const device = new Device(ip, name, language)
        await device.notify(speach)
        if (api) return `Told Google Home to say: ${speach}`
        return standardMessage(msg, `Told Google Home to say: ${speach}`)
      } catch (e) {
        if (api) return `Failed to connect to Google Hole`
        Log.error('Google Home', 'Failed to connect to Google Home', e)
        await errorMessage(msg, `Failed to connect to Google Home`)
      }
    }

    // * ------------------ Usage Logic --------------------

    return googleSpeak(args.join(' '))
  }
}
