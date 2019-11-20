const moment = require('moment')
const fs = require('fs')
const path = require('path')
const { RichEmbed } = require('discord.js')
const { Manager } = require('../../index')
const Log = require('./Log')

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

  // split array into equal chuncks
  static chunkArray(myArray, chunkSize) {
    let index = 0
    const arrayLength = myArray.length
    const tempArray = []
    let myChunk
    for (index = 0; index < arrayLength; index += chunkSize) {
      myChunk = myArray.slice(index, index + chunkSize)
      tempArray.push(myChunk)
    }

    return tempArray
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

  // sorts an array into multiple arrays based off propery
  static groupBy(array, property) {
    const hash = []
    for (let i = 0; i < array.length; i++) {
      if (!hash[array[i][property]]) hash[array[i][property]] = []
      hash[array[i][property]].push(array[i])
    }
    return hash
  }

  static makeShellSafe(text) {
    return text
      .replace(/ /g, '\\ ')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
  }

  static bytesToSize(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    // eslint-disable-next-line no-restricted-properties
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

  // Global Error Function
  static error(name, message, channel) {
    const embed = new RichEmbed()
      .setColor('#cc241d') // .setColor(config.colours.error)
      .addField('Module', name, true)
      .addField('Time', Log.time(), true)
      .addField('Message', message)

    channel = channel || null
    Log.error(name, message)

    if (channel) channel.send({ embed })
    return false
  }

  // global embed template
  static embed(msg, color = 'green') {
    const { colors } = msg.context.client
    const { author } = msg
    const embed = new RichEmbed()
      .setColor(colors[color])
      .setFooter(`Requested by: ${author.tag}`, author.avatarURL)
      .setTimestamp()

    return embed
  }
}

module.exports = Utils
