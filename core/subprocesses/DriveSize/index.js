const shell = require('shelljs')
const { performance } = require('perf_hooks')
const Subprocess = require('../../Subprocess')
// const Utils = require('../../utils/Utils')

class DriveSize extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'Drive Size',
      description: 'Updates channel names with info on google drive',
      disabled: false
    })
  }

  async run() {
    const { Log } = this.client

    const checkNewStats = () => {
      Log.info('Drive Stats', 'Started Update')
      const startTime = performance.now()
      shell.exec(`rclone size --json goog:/`, { silent: true }, async (code, stdout, stderr) => {
        const stopTime = performance.now()
        // 3 doesnt exist 0 good
        if (code === 0) {
          const response = JSON.parse(stdout)
          const { count } = response
          const size = this.client.Utils.bytesToSize(response.bytes)

          this.client.channels
            .get('646232872356937738')
            .setName(`📰\u2009\u2009\u2009ғiles\u2009\u2009\u2009${count}`)
          this.client.channels
            .get('646233131296489492')
            .setName(
              `📁\u2009\u2009\u2009size\u2009\u2009\u2009${size
                .replace('.', '_')
                .replace(' ', '\u2009\u2009\u2009')}`
            )
          Log.info(
            'Drive Stats',
            `Updated GDrive stats in ${this.client.Utils.millisecondsToTime(stopTime - startTime)}`
          )
        }
      })
    }

    checkNewStats()

    setInterval(checkNewStats, 3600000)
  }
}

module.exports = DriveSize
