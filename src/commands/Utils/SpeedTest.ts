/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import speedTest from 'speedtest-net'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'
/**
 * Command to run a network speed test
 */
export default class SpeedTest extends Command {
  constructor(client: BotClient) {
    super(client, {
      category: 'Utils',
      description: 'Runs a network speedtest',
      name: 'speedtest',
      ownerOnly: false
    })
  }

  public async run(client: BotClient, msg: NezukoMessage) {
    const { errorMessage, embed, bytesToSize } = Utils

    // Notify user that speed test is running
    const m = await msg.channel.send(embed(msg, 'green').setDescription('**:desktop: Testing network throughput...**'))

    try {
      // Initialize speed test
      const results = (await speedTest({ acceptLicense: true })) as RootObject

      // Edit original message with test information
      return m.edit(embed(msg).setImage(`${results.result.url}.png`))
    } catch {
      return errorMessage(msg, 'Failed to speedtest')
    }
  }
}
