/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { MessageEmbed, TextChannel, WebhookClient } from 'discord.js'
import later from 'later'
import speedTest from 'speedtest-net'
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'

export default class HourlySpeedTest extends Subprocess {
  speedtestChannel: string

  constructor() {
    super({
      name: 'hourlySpeedTest',
      description: 'Notifies via discord webhook your internet speed every hour',
      disabled: false
    })

    this.speedtestChannel = '687580064480755723'
  }

  public async run(client: BotClient) {
    const channel = (await client.channels.fetch(this.speedtestChannel)) as TextChannel

    const schedule = later.parse.cron('0 * * * *')

    later.setInterval(async () => {
      const results = (await speedTest({ acceptLicense: true })) as RootObject

      await channel.send(new MessageEmbed().setImage(`${results.result.url}.png`))
    }, schedule)
  }
}
