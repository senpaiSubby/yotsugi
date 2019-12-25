/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { COLORS, ExecAsync, NezukoMessage } from 'types'
import { Message, RichEmbed, TextChannel } from 'discord.js'

import { Log } from './Logger'
import { Promise } from 'bluebird'
import fs from 'fs'
import moment from 'moment'
import path from 'path'
import shelljs from 'shelljs'

export default class Utils {
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  /**
   * shellJS wrapped to become async
   * @param cmd Command to run
   * @param opts optional options
   */
  public static execAsync(cmd: string, opts = {}): Promise<ExecAsync> {
    return new Promise((resolve) => {
      shelljs.exec(cmd, opts, (code, stdout, stderr) => resolve({ code, stdout, stderr }))
    })
  }

  /**
   * Async forEach function
   * @param array Array for iterate over
   * @param callback Callback function
   */
  public static async asyncForEach(array: any[], callback: any) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  /**
   * Make embed fields always fit within limits after spliiting
   * @param array Array to split into pages
   */
  public static arraySplitter(array: any[]) {
    // Initial page size
    let pageSize = 40
    // Split array into multiple even arrays
    let splitArray = Utils.chunkArray(array, pageSize)
    // Dynamically adjust page size based on length of each array
    let willFit = false
    while (!willFit) {
      let sizeInRange = true
      // Eslint-disable-next-line no-loop-func
      splitArray.forEach((i) => {
        if (i.join().length > 1024) sizeInRange = false
      })
      if (sizeInRange) willFit = true
      pageSize--
      splitArray = Utils.chunkArray(array, pageSize)
    }
    return splitArray
  }

  /**
   * Paginite through a list of embeds
   * @param msg Original message
   * @param embedList List of embeds
   * @param acceptButton Whether to show an accept button or not
   */
  public static async paginate(msg: NezukoMessage, embedList: RichEmbed[], acceptButton?: boolean) {
    if (msg.channel.type === 'text') {
      const { author } = msg

      let page = 1
      let run = true
      const totalPages = embedList.length

      // Run our loop to wait for user input
      const currentEmbed = (await msg.channel.send('|')) as NezukoMessage
      while (run) {
        const index = page - 1
        await currentEmbed.edit(embedList[index].setFooter(`Page ${page}/${totalPages}`))

        if (totalPages !== 1) {
          if (page === 1) {
            await currentEmbed.react('⏭️')
            await currentEmbed.react('➡️')
            if (acceptButton) await currentEmbed.react('✅')
            // Await currentEmbed.react('🛑')
          } else if (page === totalPages) {
            await currentEmbed.react('⬅️')
            await currentEmbed.react('⏮️')
            if (acceptButton) await currentEmbed.react('✅')
            // Await currentEmbed.react('🛑')
          } else {
            await currentEmbed.react('⏮️')
            await currentEmbed.react('⬅️')
            await currentEmbed.react('➡️')
            await currentEmbed.react('⏭️')
            if (acceptButton) currentEmbed.react('✅')
            // Await currentEmbed.react('🛑')
          }
        }

        const collected = await currentEmbed.awaitReactions(
          (react, user) =>
            ['⬅️', '➡️', '✅', '⏭️', '⏮️', '🛑'].includes(react.emoji.name) &&
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
              await currentEmbed.clearReactions()
              return index
            case '🛑': {
              run = false
              const m = (await msg.channel.send(
                Utils.embed('green').setDescription('Canceling..')
              )) as NezukoMessage
              await m.delete(2000)
              await currentEmbed.clearReactions()
              break
            }
          }
        } else {
          run = false
          await currentEmbed.clearReactions()
        }
        await currentEmbed.clearReactions()
      }
    }
  }

  /**
   * Split an array into equal chunks
   * @param myArray Array to split
   * @param chunkSize Target length of each array
   */
  public static chunkArray(myArray: any[], chunkSize: number) {
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

  /**
   * Find file recursively based off of file extension
   * @param dir Directory to search
   * @param pattern File extension to filter
   */
  public static findNested(dir: string, pattern: string) {
    let results: any[] = []

    fs.readdirSync(dir).forEach((innerDir) => {
      innerDir = path.resolve(dir, innerDir)

      const stat = fs.statSync(innerDir)

      if (stat.isDirectory()) results = results.concat(this.findNested(innerDir, pattern))

      if (stat.isFile() && innerDir.endsWith(pattern)) results.push(innerDir)
    })
    return results
  }

  /**
   * Add the specified number of white space characters
   * @param count Number of space to add
   */
  public static addSpace(count: number) {
    if (count === 0) count = 1
    return '\ufeff '.repeat(count)
  }

  /**
   * Capitilize the first letter of the string
   * @param text String to capitilize
   */
  public static capitalize(text: string) {
    return `${text.charAt(0).toUpperCase()} ${text.slice(1).toLowerCase()}`
  }

  /**
   * Sort an array based of key
   * @param array Array to sort
   * @param key Key to sort by
   */
  public static sortByKey(array: any[], key: string) {
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

  /**
   * Sort an Array into multiple based off property
   * @param array Array to split
   * @param property Property to split by
   */
  public static groupBy(array: any[], property: string) {
    const hash: any[] = []
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < array.length; i++) {
      if (!hash[array[i][property]]) hash[array[i][property]] = []
      hash[array[i][property]].push(array[i])
    }
    return hash
  }

  /**
   * Make text safe for writing file names
   * @param text Text to make safe
   */
  public static makeShellSafe(text: string) {
    return text
      .replace(/ /g, '\\ ')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
  }

  /**
   * Convert bytes to standard file sizes
   * @param bytes Bytes to convert
   * @param decimals Number of decimal places
   */
  public static bytesToSize(bytes: number, decimals = 1) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    // Eslint-disable-next-line no-restricted-properties
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  /**
   * Convert miliseconds to standard time
   * @param ms Miliseconds
   */
  public static millisecondsToTime(ms: number) {
    const duration = moment.duration(ms)
    if (duration.asHours() > 1) {
      return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss')
    }

    return moment.utc(duration.asMilliseconds()).format('mm:ss')
  }

  /**
   * Sleep for specified miliseconds
   * @param ms Miliseconds to sleep
   */
  public static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Standard error embed sent to channel when a command fails
   * @param name Name of error
   * @param message Original message
   * @param channel Channel
   */
  public static error(name: string, message: Message, channel: TextChannel) {
    const embed = new RichEmbed()
      .setColor('#cc241d') // .setColor(config.colours.error)
      .addField('Module', name, true)
      .addField('Time', new Date(), true)
      .addField('Message', message)

    channel = channel || null
    Log.error(name, message, null)

    if (channel) channel.send({ embed })
    return false
  }

  /**
   * Standard Nezuko embed wrapper
   * @param color Color of embed
   * @param image Optional image from images dir to set as thumbnail
   */
  public static embed(color = 'green', image?: string) {
    const colors: COLORS = {
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
      // E.attachFile(join(`${__dirname}`, '../', `/core/images/icons/${image}`))
      // e.setThumbnail(`attachment://${image}`)
      e.setThumbnail(
        `https://raw.githubusercontent.com/callmekory/nezuko/master/nezuko/core/images/icons/${image}`
      )
    }
    return e
  }

  /**
   * Inform the user that a config is missing
   * @param msg Original message
   * @param name Name of config that is missing
   * @param params Array of parameters that should be set
   */
  public static missingConfig(msg: NezukoMessage, name: string, params: any[]) {
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

  /**
   * Send a default error message with the specified text
   * @param msg Original Message
   * @param text Text for the embed to return
   */
  public static errorMessage(msg: NezukoMessage, text: string) {
    return msg.channel.send(Utils.embed('red').setDescription(`:rotating_light: **${text}**`))
  }

  /**
   * Send a default warning embed message with the specified text
   * @param msg Original Message
   * @param text Text for the embed to return
   */
  public static warningMessage(msg: NezukoMessage, text: string) {
    return msg.channel.send(Utils.embed('yellow').setDescription(`:warning: **${text}**`))
  }

  /**
   * Send a default embed message with the specified text
   * @param msg Original Message
   * @param text Text for the embed to return
   */
  public static standardMessage(msg: NezukoMessage, text: string) {
    return msg.channel.send(Utils.embed('green').setDescription(`**${text}**`))
  }

  /**
   * Display the given options in a nice embed
   * @param msg Original message
   * @param options Array of options to display
   */
  public static async validOptions(msg: NezukoMessage, options: string[]) {
    const m = (await msg.channel.send(
      Utils.embed('yellow', 'question.png').setDescription(
        `:grey_question: **Valid options are:\n\n- ${options.join('\n- ')}**`
      )
    )) as NezukoMessage
    return m.delete(20000)
  }
}
