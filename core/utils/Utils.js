const moment = require('moment')
const fs = require('fs')
const path = require('path')
const { Manager } = require('../../index')

class Utils {
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  static runCommand(client, cmdString) {
    const commandName = cmdString.split(' ').shift()
    const cmd = Manager.findCommand(commandName)
    const args = cmdString.split(' ').slice(1)
    if (cmd) {
      if (!cmd.disabled) {
        try {
          Manager.runCommand(cmd, null, args, 'api')
          return 'success'
        } catch (error) {
          Log.warn(error)
          return 'failure'
        }
      } else {
        return 'command disabled'
      }
    }
  }

  static findNested(dir, pattern) {
    let results = []

    fs.readdirSync(dir).forEach((innerDir) => {
      innerDir = path.resolve(dir, innerDir)

      const stat = fs.statSync(innerDir)

      if (stat.isDirectory()) {
        results = results.concat(this.findNested(innerDir, pattern))
      }
      if (stat.isFile() && innerDir.endsWith(pattern)) {
        results.push(innerDir)
      }
    })
    return results
  }

  static addSpace(count) {
    return '\ufeff '.repeat(count)
  }

  static capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  static sortByKey(array, key) {
    let sortOrder
    if (key[0] === '-') {
      sortOrder = -1
      key = key.substr(1)
    }
    if (sortOrder === -1) {
      return array.sort((a, b) => {
        const x = a[key]
        const y = b[key]
        return x < y ? -1 : x > y ? 1 : 0
      })
    }
    return array.sort((a, b) => {
      const x = b[key]
      const y = a[key]
      return x < y ? -1 : x > y ? 1 : 0
    })
  }

  static bytesToSize(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  static millisecondsToTime(ms) {
    const duration = moment.duration(ms)
    if (duration.asHours() > 1) {
      return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss')
    }
    return moment.utc(duration.asMilliseconds()).format('mm:ss')
  }

  static sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}

module.exports = Utils
