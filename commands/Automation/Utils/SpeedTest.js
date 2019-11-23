const speedTest = require('speedtest-net')
const Command = require('../../../core/Command')

class SpeedTest extends Command {
  constructor(client) {
    super(client, {
      name: 'speedtest',
      category: 'Utils',
      description: 'Runs a speedtest'
    })
  }

  async run(client, msg, args) {
    const { Utils, p } = client
    const { author, channel } = msg

    const test = speedTest({ maxTime: 5000 })
    const m = await channel.send(
      Utils.embed(msg, 'green').setDescription(
        `:desktop: **Testing network throughput.\n\n:hourglass: Be back in a few seconds.**`
      )
    )

    test.on('data', async (data) => {
      const { download, upload } = data.speeds
      const { isp, isprating } = data.client
      const { location, ping } = data.server
      const embed = Utils.embed(msg, 'green')
        .addField(':arrow_down: Download', `${download}`, true)
        .addField(' :arrow_up: Upload', `${upload}`, true)
        .addField(':globe_with_meridians: Ping', `${ping}`, true)
        .addField(':classical_building: ISP', `${isp}`, true)
        .addField(':star: Rating', `${isprating}`, true)
        .addField(':flag_us: Location', `${location}`, true)

      return m.edit(embed)
    })

    test.on('error', async () => {
      return m.edit(
        Utils.embed(msg, 'green').setDescription(`:rotating_light: ** Failed to test **`)
      )
    })
  }
}
module.exports = SpeedTest
