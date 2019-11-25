const shell = require('shelljs')
const { performance } = require('perf_hooks')
const Subprocess = require('../../Subprocess')
// const Utils = require('../../utils/Utils')

class DriveSize extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'Drive Size',
      description: 'Updates channel names with info on google drive',
      disabled: true
    })
  }

  async run() {
    const { Log, channels, Utils } = this.client

    const checkNewStats = () => {
      Log.info('Drive Stats', 'Started Update')
      const startTime = performance.now()
      shell.exec(`rclone size --json goog:/`, { silent: true }, async (code, stdout) => {
        const stopTime = performance.now()
        // 3 doesnt exist 0 good
        if (code === 0) {
          const response = JSON.parse(stdout)
          const { count } = response
          const size = Utils.bytesToSize(response.bytes)

          channels
            .get('646309179354513420')
            .setName(`📰\u2009\u2009\u2009ғiles\u2009\u2009\u2009${count}`)
          channels
            .get('646309200686874643')
            .setName(
              `📁\u2009\u2009\u2009size\u2009\u2009\u2009${size
                .replace('.', '_')
                .replace(' ', '\u2009\u2009\u2009')}`
            )
          Log.info(
            'Drive Stats',
            `Updated GDrive stats in ${Utils.millisecondsToTime(stopTime - startTime)}`
          )
        }
      })
    }

    checkNewStats()

    setInterval(checkNewStats, 14400000)
  }
}

module.exports = DriveSize
