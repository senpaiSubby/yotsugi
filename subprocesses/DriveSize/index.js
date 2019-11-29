const { performance } = require('perf_hooks')
const Subprocess = require('../../core/Subprocess')
const { client } = require('../../index')

class DriveSize extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'Drive Size',
      description: 'Updates channel names with info on google drive',
      disabled: false
    })
  }

  async run() {
    const { Log, channels, Utils } = client
    const { execAsync } = Utils

    let start = 0

    const checkNewStats = async () => {
      if (start === 1) Log.info('Drive Stats', 'Started Update')

      const startTime = performance.now()

      const { code, stdout } = await execAsync(`rclone size --json goog:/`, { silent: true })

      const stopTime = performance.now()
      // 3 doesnt exist 0 good
      if (code === 0) {
        const response = JSON.parse(stdout)
        const { count } = response
        const size = Utils.bytesToSize(response.bytes)

        await channels
          .get('646309179354513420')
          .setName(`📰\u2009\u2009\u2009ғiles\u2009\u2009\u2009${count}`)

        await channels
          .get('646309200686874643')
          .setName(
            `📁\u2009\u2009\u2009size\u2009\u2009\u2009${size
              .replace('.', '_')
              .replace(' ', '\u2009\u2009\u2009')}`
          )

        return Log.info(
          'Drive Stats',
          `Updated Rclone stats in ${Utils.millisecondsToTime(stopTime - startTime)}`
        )
      }

      return Log.warn('Drive Stats', `Failed to update Rclone stats`)
    }

    await checkNewStats()
    start = 1

    setInterval(checkNewStats, 14400000)
  }
}

module.exports = DriveSize
