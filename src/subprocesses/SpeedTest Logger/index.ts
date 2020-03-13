/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { RichEmbed, WebhookClient } from 'discord.js'
import later from 'later'
import speedTest from 'speedtest-net'
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'

export default class Template extends Subprocess {
  constructor(client: BotClient) {
    super(client, {
      name: 'SpeedTest Logger',
      description: 'Notifies via discord webhook your internet speed every hour',
      disabled: false
    })

    this.client = client
  }

  public async run() {
    const webhook = new WebhookClient(
      '687581246196678676',
      'ilN2cqIni8CmCbs_mUUjPu__lsBUwKkSYWlj0Vl_eKWYf-3mkGRc6F9wq1WnofwltSpQ'
    )

    const schedule = later.parse.cron('0 * * * *')

    later.setInterval(async () => {
      const test = speedTest({ maxTime: 5000 })

      test.on('data', async (data: SpeedTestResult) => {
        const { download, upload } = data.speeds
        const { isp, isprating } = data.client
        const { location, ping } = data.server

        const embed = new RichEmbed()
          .setTitle('Speedtest')
          .setThumbnail(
            'https://raw.githubusercontent.com/callmekory/nezuko/master/src/core/images/icons/speedtest.png'
          )
          .addField(':arrow_down: Download', `${download}`, true)
          .addField(' :arrow_up: Upload', `${upload}`, true)
          .addField(':globe_with_meridians: Ping', `${ping}`, true)
          .addField(':classical_building: ISP', `${isp}`, true)
          .addField(':star: Rating', `${isprating}`, true)
          .addField(':flag_us: Location', `${location}`, true)

        await webhook.send('Here\'s your hourly speedtest report.', {
          username: 'Nezuko - Internet Speed Test',
          avatarURL: 'https://raw.githubusercontent.com/callmekory/nezuko/master/src/core/images/icons/speedtest.png',
          embeds: [embed]
        })
      })
    }, schedule)
  }
}
