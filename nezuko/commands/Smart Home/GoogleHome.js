const { Device } = require('google-home-notify-client')
const Command = require('../../core/Command')

module.exports = class GoogleHome extends Command {
  constructor(client) {
    super(client, {
      name: 'say',
      category: 'Smart Home',
      description: 'Speak through Google Home',
      usage: [`say <msg>`],
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------

    const { p, Utils, Logger } = client
    const { errorMessage, missingConfig, standardMessage } = Utils

    // * ------------------ Config --------------------

    const { ip, name, language } = client.db.config.googleHome

    // * ------------------ Check Config --------------------

    if (!ip || !name || !language) {
      const settings = [
        `${p}config set googleHome name <name>`,
        `${p}config set googleHome ip <ip addy>`,
        `${p}config set googleHome language <en/fr>`
      ]
      return missingConfig(msg, 'googleHome', settings)
    }

    // * ------------------ Logic --------------------

    const googleSpeak = async (speach) => {
      try {
        const device = new Device(ip, name, language)
        await device.notify(speach)
        if (api) return `Told Google Home to say [ ${speach} ]`
        return standardMessage(msg, `Told Google Home to say [ ${speach} ]`)
      } catch (e) {
        if (api) return `Failed to connect to Google Home`
        Logger.error('Google Home', 'Failed to connect to Google Home', e)
        await errorMessage(msg, `Failed to connect to Google Home`)
      }
    }

    // * ------------------ Usage Logic --------------------

    return googleSpeak(args.join(' '))
  }
}
