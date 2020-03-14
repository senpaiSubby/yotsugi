/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Promise as promise } from 'bluebird'
import {
  DMChannel,
  GroupDMChannel,
  GuildMember,
  Message,
  PermissionResolvable,
  RichEmbed,
  TextChannel
} from 'discord.js'
import fs from 'fs'
import moment from 'moment'
import path from 'path'
import shelljs from 'shelljs'
import { ExecAsync, NezukoMessage } from 'typings'

import * as config from '../config/config.json'
import { Log } from './Logger'

export class Utils {
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  /**
   *
   * @param user GuildeMember to check perms of
   * @param permsNeeded Permission list to check against
   */
  public static checkPerms(user: GuildMember, permsNeeded: PermissionResolvable[]) {
    const missingPerms: PermissionResolvable[] = []

    if (user.id !== config.ownerID && !config.exemptUsers.includes(user.id)) {
      for (const perm of permsNeeded) {
        if (!user.permissions.has(perm)) missingPerms.push(perm)
      }
    }
    return missingPerms
  }

  /**
   * ShellJS exec wrapper in Async
   * @param cmd Command to run
   * @param opts Run options
   */
  public static execAsync(cmd: string, opts = {}): Promise<ExecAsync> {
    return new promise((resolve) => {
      shelljs.exec(cmd, opts, (code: number, stdout: string, stderr: string) => resolve({ code, stdout, stderr }))
    })
  }

  /**
   *
   * @param array Array to iterate over
   * @param callback Callback function for data use
   */
  public static async asyncForEach(array: any[], callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  /**
   * Splits an array into multiple untill it is within 1024 characters
   * @param array Array to split
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
      for (const i of splitArray) {
        if (i.join().length > 1024) sizeInRange = false
      }

      if (sizeInRange) {
        willFit = true
      } else {
        pageSize--
        splitArray = Utils.chunkArray(array, pageSize)
      }
    }
    return splitArray
  }

  /**
   * Paginates RichEmbeds
   * @param msg Original message
   * @param embedList RichEmbed list
   * @param [acceptButton] Show accept button?
   */
  public static async paginate(msg: NezukoMessage, embedList: any[], acceptButton?: boolean) {
    const { author } = msg

    let page = 1
    let running = true
    const totalPages = embedList.length

    // Run our loop to wait for user input
    const paginated = (await msg.channel.send('|')) as NezukoMessage
    while (running) {
      const index = page - 1
      try {
        // For embeds
        await paginated.edit(embedList[index].setFooter(`Page ${page}/${totalPages}`))
      } catch {
        // For non embeds
        await paginated.edit(`${embedList[index]} \`Page ${page}/${totalPages}\``)
      }
      if (totalPages !== 1) {
        if (page === 1) {
          await paginated.react('⏭️')
          await paginated.react('➡️')
          if (acceptButton) await paginated.react('✅')
          // Await paginated.react('🛑')
        } else if (page === totalPages) {
          await paginated.react('⬅️')
          await paginated.react('⏮️')
          if (acceptButton) await paginated.react('✅')
          // Await paginated.react('🛑')
        } else {
          await paginated.react('⏮️')
          await paginated.react('⬅️')
          await paginated.react('➡️')
          await paginated.react('⏭️')
          if (acceptButton) await paginated.react('✅')
          // Await paginated.react('🛑')
        }
      }

      const collected = await paginated.awaitReactions(
        // tslint:disable-next-line: no-shadowed-variable
        (reaction, user) => ['⬅️', '➡️', '✅', '⏭️', '⏮️', '🛑'].includes(reaction.emoji.name) && user.id === author.id,
        { max: 1, time: 60000 }
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
            running = false
            await paginated.clearReactions()
            return index
          case '🛑': {
            running = false
            const m = (await msg.channel.send(Utils.embed(msg, 'green').setDescription('Canceling..'))) as NezukoMessage
            await m.delete(2000)
            await paginated.clearReactions()
            break
          }
        }
      } else {
        running = false
        await paginated.clearReactions()
      }
      await paginated.clearReactions()
    }
  }

  /**
   * Split array into equal chunks
   * @param myArray Array to split
   * @param chunkSize size of each split
   * @returns
   */
  public static chunkArray(myArray: any[], chunkSize: number) {
    let index
    const arrayLength = myArray.length
    const tempArray = []
    let myChunk: any[]
    for (index = 0; index < arrayLength; index += chunkSize) {
      myChunk = myArray.slice(index, index + chunkSize)
      tempArray.push(myChunk)
    }

    return tempArray
  }

  /**
   * Finds nested files in a directory matching the pattern specified
   * @param dir Path of directory
   * @param pattern Math pattern for file extension
   */
  public static findNested(dir: string, pattern: string) {
    let results = []

    fs.readdirSync(dir).forEach((innerDir) => {
      innerDir = path.resolve(dir, innerDir)

      const stat = fs.statSync(innerDir)

      if (stat.isDirectory()) {
        results = results.concat(this.findNested(innerDir, pattern))
      }

      if (stat.isFile() && innerDir.endsWith(pattern)) results.push(innerDir)
    })
    return results
  }

  /**
   * Add's a set ammount of spaces
   * @param count Number of spaces to add
   */
  public static addSpace(count: number) {
    return ' '.repeat(count)
  }

  /**
   * Capitalized the first letter of a string
   * @param text Text to capitalize the first letter of
   */
  public static capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  /**
   * Sorts an array by key
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
   * Splits an array based off of a property
   * @param array Array to group
   * @param property Property to group by
   */
  public static groupBy(array: any[], property: string | number) {
    const hash = []
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < array.length; i++) {
      if (!hash[array[i][property]]) hash[array[i][property]] = []
      hash[array[i][property]].push(array[i])
    }
    return hash
  }

  /**
   * Converts bytes into human readable form
   * @param bytes Bytes to convert
   * @param decimals How many decimal places to include
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
   * Converts milliseconds to HH:MM format
   * @param ms Milliseconds
   */
  public static millisecondsToTime(ms: number) {
    const duration = moment.duration(ms)
    if (duration.asHours() > 1) {
      return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss')
    }

    return moment.utc(duration.asMilliseconds()).format('mm:ss')
  }

  /**
   * Async sleep
   * @param ms Milliseconds to sleep
   */
  public static sleep(ms: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Global Error Function
  public static async error(name: string, message: string, channel: TextChannel | DMChannel | GroupDMChannel) {
    const embed = new RichEmbed()
      .setColor('#cc241d')
      .addField('Module', name, true)
      .addField('Time', new Date(), true)
      .addField('Message', message)

    channel = channel || null
    Log.warn(name, message)

    if (channel) await channel.send({ embed })
    return false
  }

  // Global embed template
  public static embed(msg: NezukoMessage | Message | boolean = false, color = 'green', image?: string) {
    const colors = {
      red: '#fb4934',
      green: '#7C835B',
      blue: '#83a598',
      yellow: '#fabd2f',
      orange: '#d79921',
      white: '#ebdbb2',
      black: '#282828',
      grey: '#928374'
    }
    const e = new RichEmbed().setColor(colors[color] ? colors[color] : color)

    if (image) {
      e.setThumbnail(`https://raw.githubusercontent.com/callmekory/nezuko/master/src/core/images/icons/${image}`)
    }
    return e
  }

  public static missingConfig(msg: NezukoMessage, name: string, params: string[]) {
    return msg.channel.send(
      Utils.embed(msg, 'red', 'settings.png')
        .setTitle(`Missing [ ${name} ] config!`)
        .setDescription(
          `\`${msg.p}config get ${name}\` for current config.

          Set them like so..

          \`\`\`css\n${params.join('\n')}\n\`\`\``
        )
    )
  }

  public static errorMessage(msg: NezukoMessage | Message, text: string) {
    return msg.channel.send(Utils.embed(msg, 'red').setDescription(`:rotating_light: **${text}**`))
  }

  public static warningMessage(msg: NezukoMessage | Message, text: string) {
    return msg.channel.send(Utils.embed(msg, 'yellow').setDescription(`:warning: **${text}**`))
  }

  public static standardMessage(msg: NezukoMessage | Message, color: string, text: string) {
    return msg.channel.send(Utils.embed(msg, color).setDescription(`**${text}**`))
  }

  // Standard valid options return
  public static async validOptions(msg: NezukoMessage | Message, options: string[]) {
    const m = (await msg.channel.send(
      Utils.embed(msg, 'yellow', 'question.png').setDescription(
        `:grey_question: **Valid options are:\n\n- ${options.join('\n- ')}**`
      )
    )) as NezukoMessage
    return m.delete(20000)
  }
}
