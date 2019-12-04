const moment = require('moment')
const fs = require('fs')
const path = require('path')
const { RichEmbed } = require('discord.js')
const Promise = require('bluebird')
const shelljs = require('shelljs')
const Log = require('./Log')

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

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
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
    const { author } = msg

    let page = 1
    let run = true
    const totalPages = embedList.length

    // run our loop to wait for user input
    const paginated = await msg.channel.send('|')
    while (run) {
      const index = page - 1
      await paginated.edit(embedList[index].setFooter(`Page ${page}/${totalPages}`))

      if (totalPages !== 1) {
        if (page === 1) {
          await paginated.react('⏭️')
          await paginated.react('➡️')
          if (acceptButton) await paginated.react('✅')
          // await paginated.react('🛑')
        } else if (page === totalPages) {
          await paginated.react('⬅️')
          await paginated.react('⏮️')
          if (acceptButton) await paginated.react('✅')
          // await paginated.react('🛑')
        } else {
          await paginated.react('⏮️')
          await paginated.react('⬅️')
          await paginated.react('➡️')
          await paginated.react('⏭️')
          if (acceptButton) paginated.react('✅')
          // await paginated.react('🛑')
        }
      }

      const collected = await paginated.awaitReactions(
        (reaction, user) =>
          ['⬅️', '➡️', '✅', '⏭️', '⏮️', '🛑'].includes(reaction.emoji.name) &&
          user.id === author.id,
        { max: 1, time: 3600000 }
      )

      const reaction = collected.first()
      if (reaction) {
        switch (reaction.emoji.name) {
          case '⬅️':
            page--
            break
          case '⏮️':
            page = 1
            break
          case '➡️':
            page++
            break
          case '⏭️':
            page = totalPages
            break
          case '✅':
            run = false
            await paginated.clearReactions()
            return index
          case '🛑': {
            run = false
            const m = await msg.channel.send(Utils.embed('green').setDescription('Canceling..'))
            await m.delete(2000)
            await paginated.clearReactions()
            break
          }
        }
      } else {
        run = false
        await paginated.clearReactions()
      }
      await paginated.clearReactions()
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
  static embed(color = 'green', image = false) {
    const colors = {
      red: '#fb4934',
      green: '#8ec07c',
      blue: '#83a598',
      yellow: '#fabd2f',
      orange: '#d79921',
      white: '#ebdbb2',
      black: '#282828',
      grey: '#928374'
    }
    const e = new RichEmbed().setColor(colors[color] ? colors[color] : color)

    if (image) {
      // e.attachFile(join(`${__dirname}`, '../', `/core/images/icons/${image}`))
      // e.setThumbnail(`attachment://${image}`)
      e.setThumbnail(
        `https://raw.githubusercontent.com/callmekory/nezuko/master/nezuko/core/images/icons/${image}`
      )
    }
    return e
  }

  static missingConfig(msg, name, params) {
    return msg.channel.send(
      Utils.embed('red', 'settings.png')
        .setTitle(`Missing [ ${name} ] config!`)
        .setDescription(
          `\`${msg.p}config get ${name}\` for current config.

          Set them like so..

          \`\`\`css\n${params.join('\n')}\n\`\`\``
        )
    )
  }

  static errorMessage(msg, text) {
    return msg.channel.send(Utils.embed('red').setDescription(`:rotating_light: **${text}**`))
  }

  static warningMessage(msg, text) {
    return msg.channel.send(Utils.embed('yellow').setDescription(`:warning: **${text}**`))
  }

  static standardMessage(msg, text) {
    return msg.channel.send(Utils.embed('green').setDescription(`**${text}**`))
  }

  // standard valid options return
  static async validOptions(msg, options) {
    const m = await msg.channel.send(
      Utils.embed('yellow').setDescription(
        `:grey_question: **Valid options are:\n\n- ${options.join('\n- ')}**`
      )
    )
    return m.delete(20000)
  }
}
