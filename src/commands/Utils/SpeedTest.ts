/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import speedTest from 'speedtest-net'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class SpeedTest extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'speedtest',
      category: 'Utils',
      description: 'Runs a network speedtest',
      ownerOnly: false
    })
  }

  public async run(client: BotClient, msg: NezukoMessage) {
    const { Utils } = client
    const { errorMessage, embed } = Utils

    const test = speedTest({ maxTime: 5000 })
    const m = (await msg.channel.send(
      embed(msg, 'green').setDescription(`**:desktop: Testing network throughput...**`)
    )) as Message

    test.on('data', async (data: SpeedTestResult) => {
      const { download, upload } = data.speeds
      const { isp, isprating } = data.client
      const { location, ping } = data.server

      return m.edit(
        embed(msg, 'green', 'speedtest.png')
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
