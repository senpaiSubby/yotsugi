const speedTest = require('speedtest-net')
import { Command } from '../../core/Command'

export default  class SpeedTest extends Command {
  constructor(client) {
    super(client, {
      name: 'speedtest',
      category: 'Networking',
      description: 'Runs a network speedtest'
    })
  }

  async run(client, msg) {
    const { Utils } = client
    const { errorMessage, embed } = Utils

    const test = speedTest({ maxTime: 5000 })
    const m = await msg.channel.send(
      embed('green').setDescription(`**:desktop: Testing network throughput...**`)
    )

    test.on('data', async (data) => {
      const { download, upload } = data.speeds
      const { isp, isprating } = data.client
      const { location, ping } = data.server

      return m.edit(
        embed('green', 'speedtest.png')
          .setTitle('Speedtest')
          .addField(':arrow_down: Download', `${download}`, true)
          .addField(' :arrow_up: Upload', `${upload}`, true)
          .addField(':globe_with_meridians: Ping', `${ping}`, true)
          .addField(':classical_building: ISP', `${isp}`, true)
          .addField(':star: Rating', `${isprating}`, true)
          .addField(':flag_us: Location', `${location}`, true)
      )
    })

    test.on('error', async () => errorMessage(msg, `Failed to speedtest`))
  }
}
