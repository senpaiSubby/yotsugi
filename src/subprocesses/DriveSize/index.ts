/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { TextChannel } from 'discord.js'
import { performance } from 'perf_hooks'
import { ExecAsync } from 'typings'
import { Subprocess } from '../../core/base/Subprocess'
import { NezukoClient } from '../../core/NezukoClient'

class DriveSize extends Subprocess {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'Drive Size',
      description: 'Updates channel names with info on google drive',
      disabled: false
    })

    this.client = client
  }

  public async run() {
    const { Log, channels, Utils } = this.client
    const { execAsync, bytesToSize } = Utils

    const configPath = `${__dirname}/../../config/rclone.conf`

    const checkNewStats = async () => {
      Log.info('Drive Stats', 'Started Update')

      const args = [
        'tld-0day',
        'tld-anime',
        'tld-books',
        'tld-games',
        'tld-main',
        'tld-music',
        'tld-programs',
        'tld-showsMovies',
        'tld-websites'
      ]

      let totalSize = 0
      let totalFiles = 0

      const startTime = performance.now()

      for (const remote of args) {
        const { code, stdout } = (await execAsync(
          `rclone size --json "${remote}:/" --config="${configPath}"`,
          {
            silent: true
          }
        )) as ExecAsync

        if (code === 0) {
          const response = JSON.parse(stdout)
          const { count, bytes } = response

          totalSize += bytes
          totalFiles += count
        }
      }

      const stopTime = performance.now()

      const fileCountChannel = channels.get('646309179354513420') as TextChannel
      await fileCountChannel.setName(`📰\u2009\u2009\u2009ғiles\u2009\u2009\u2009${totalFiles}`)

      const driveSizeChannel = channels.get('646309200686874643') as TextChannel
      await driveSizeChannel.setName(
        `📁\u2009\u2009\u2009size\u2009\u2009\u2009${bytesToSize(totalSize)
          .replace('.', '_')
          .replace(' ', '\u2009\u2009\u2009')}`
      )

      return Log.info(
        'Drive Stats',
        `Updated Rclone stats in ${Utils.millisecondsToTime(stopTime - startTime)}`
      )
    }

    await checkNewStats()

    setInterval(checkNewStats, 14400000)
  }
}

export default DriveSize
