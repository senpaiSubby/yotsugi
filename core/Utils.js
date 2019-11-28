const moment = require('moment')
const fs = require('fs')
const path = require('path')
const { RichEmbed } = require('discord.js')
const Log = require('./Log')
const Promise = require('bluebird')
const shelljs = require('shelljs')

module.exports = class Utils {
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  static execAsync(cmd, opts = {}) {
    return new Promise((resolve) => {
      shelljs.exec(cmd, opts, (code, stdout, stderr) => {
        return resolve({ code, stdout, stderr })
      })
    })
  }

  // make embed fields always fit within limits after spliiting
  static arraySplitter(array) {
    // initial page size
    let pageSize = 40
    // split array into multiple even arrays
    let splitArray = Utils.chunkArray(array, pageSize)
    // dynamically adjust page size based on length of each array
    let willFit = false
    while (!willFit) {
      let sizeInRange = true
      // eslint-disable-next-line no-loop-func
      splitArray.forEach((i) => {
        if (i.join().length > 1024) sizeInRange = false
      })
      if (sizeInRange) willFit = true
      pageSize--
      splitArray = Utils.chunkArray(array, pageSize)
    }
    return splitArray
  }

  // paginates embeds
  static async paginate(msg, embedList, acceptButton = false) {
    // topBottom 1 = page status in description else in footer
    // start page at 0
    let page = 0
    let run = true
    const { author } = msg
    const totalPages = embedList.length

    // run our loop to wait for user input
    const editMessage = await msg.channel.send('|')
    while (run) {
      await editMessage.edit(embedList[page].setFooter(`Page ${page + 1}/${totalPages}`))

      if (totalPages !== 1) {
        if (page === 0) {
          await editMessage.react('➡️')
          if (acceptButton) await editMessage.react('✅')
        } else if (page + 1 === totalPages) {
          await editMessage.react('⬅️')
          if (acceptButton) await editMessage.react('✅')
        } else {
          await editMessage.react('⬅️')
          await editMessage.react('➡️')
          if (acceptButton) await editMessage.react('✅')
        }
      }

      const collected = await editMessage.awaitReactions(
        (reaction, user) =>
          ['⬅️', '➡️', '✅'].includes(reaction.emoji.name) && user.id === author.id,
        { max: 1, time: 60000 }
      )

      const reaction = collected.first()
      if (reaction) {
        switch (reaction.emoji.name) {
          case '⬅️':
            page--
            break
          case '➡️':
            page++
            break
          case '✅':
            run = false
            await editMessage.clearReactions()
            return page
          default:
            break
        }
      } else {
        run = false
        return editMessage.clearReactions()
      }
      await editMessage.clearReactions()
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

      if (stat.isDirectory()) results = results.concat(this.findNested(innerDir, pattern))

      if (stat.isFile() && innerDir.endsWith(pattern)) results.push(innerDir)
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
    return new Promise((resolve) => setTimeout(resolve, ms))
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
    return new RichEmbed().setColor(colors[color] ? colors[color] : color)
  }

  static async missingConfig(msg, name, params) {
    return msg.channel.send(
      Utils.embed(msg, 'red')
        .setTitle(`:gear: Missing ${name} DB config!`)
        .setDescription(
          `${msg.prefix}db get ${name} for current config.

          Set them like so..

          \`\`\`css\n${params.join('\n')}\n\`\`\``
        )
    )
  }

  static async errorMessage(msg, text) {
    const m = await msg.channel.send(
      Utils.embed(msg, 'red').setDescription(`:rotating_light: **${text}**`)
    )
    return m.delete(20000)
  }

  static async warningMessage(msg, text) {
    const m = await msg.channel.send(
      Utils.embed(msg, 'yellow').setDescription(`:warning: **${text}**`)
    )
    return m.delete(20000)
  }

  static async standardMessage(msg, text) {
    return msg.channel.send(Utils.embed(msg).setDescription(`**${text}**`))
  }

  // standard valid options return
  static async validOptions(msg, options) {
    const m = await msg.channel.send(
      Utils.embed(msg, 'yellow').setDescription(
        `:grey_question: **Valid options are:\n\n- ${options.join('\n- ')}**`
      )
    )
    return m.delete(20000)
  }
}
