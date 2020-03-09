/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GuildChannel, Message } from 'discord.js'
import { existsSync } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'

/**
 * TODO make rclone update stats on the server stats category
 * Manage Rclone
 */
export default class RClone extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'rclone',
      category: 'Management',
      aliases: ['drive'],
      description: 'Get info on RClone remotes',
      usage: [
        'rclone list',
        'rclone size <remote>:/<dir>',
        'rclone ls <remote>:/<dir>',
        'rclone sizeof <remote1> <remote2> <remote3> <remote4>',
        'rclone find <remote> <search terms>',
        'rclone find <remote> <search terms> -filter <dir or file extension>'
      ],
      args: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { channel, guild } = msg

    const {
      errorMessage,
      warningMessage,
      validOptions,
      embed,
      bytesToSize,
      millisecondsToTime,
      arraySplitter,
      paginate,
      execAsync,
      standardMessage
    } = Utils

    // * ------------------ Config --------------------

    const configPath = `${__dirname}/../../config/rclone.conf`

    // * ------------------ Check Config --------------------

    if (!existsSync(configPath)) {
      return warningMessage(
        msg,
        `RClone config is missing!
        Place your \`rclone.conf\` file inside the \`/build/config\` directory of Nezuko!`
      )
    }

    // * get remotes from config
    const { code: c, stdout: o } = await execAsync(
      `rclone listremotes --config='${configPath}'`,
      {
        silent: true
      }
    )

    if (c !== 0) return errorMessage(msg, `A error occurred with Rclone`)

    const remotes = o
      .replace(/:/g, '')
      .split('\n')
      .filter(Boolean)

    // * ------------------ Logic --------------------

    /**
     * TODO make this customizable via the rclone command
     * @param remote Rclone remote
     * @param size Size to be displayed in channel name
     */
    const handleChannelStats = async (remote: string, size: string) => {
      switch (remote) {
        case 'AnimeDrive': {
          const channelToName = client.channels.get(
            '666705180250865678'
          ) as GuildChannel
          if (channelToName) await channelToName.setName(`ᴛᴅ sɪᴢᴇ: ${size}`)
        }
      }
    }

    const command = args.shift()

    switch (command) {
      case 'find': {
        const remote = args[0]
        // Remove remote from argument list
        args.shift()

        // Variable to hold filter if applicable
        let filter

        // Find index of flag if specified
        const flagIndex = args.findIndex((s) => s === '-type')
        // If flag
        if (flagIndex !== -1) {
          // And flag argument
          if (args[flagIndex + 1]) {
            // Set filter
            filter = args[flagIndex + 1]
            // Remove flag and filter from argument list
            args.splice(flagIndex, flagIndex + 1)
          } else {
            // If no filter args specified notify user
            return warningMessage(
              msg,
              `You specified and blank filter. Correct usage would be like \`-type folder\` or \`-type .mp4\``
            )
          }
        }

        // TODO allow user to specify the folder to search in
        const searchTerms = args

        if (!searchTerms.length) {
          return warningMessage(
            msg,
            `Please specify what you want to search for`
          )
        }

        if (!remotes.includes(remote)) {
          return errorMessage(
            msg,
            `Remote [ ${remote} ] doesn't exist in RClone config`
          )
        }

        const waitMessage = (await channel.send(
          embed(msg, 'yellow', 'rclone.gif').setDescription(
            `**Searching [ ${remote} ] for [ ${searchTerms.join(' ')} ]**`
          )
        )) as Message

        // TODO add a check to see if file or database is initialized and if not initialize and inform user

        const db = await database.models.RcloneCache.findOne({
          where: { id: remote }
        })

        if (!db) {
          return errorMessage(
            msg,
            `No cache has been run for remote [ ${remote} ]. One will be generated soon. Please try again later.`
          )
        }

        const data = JSON.parse(db.get('cache') as string)

        let results = data.filter((item) => {
          let match = 0

          searchTerms.forEach((term) => {
            const reg = new RegExp(term, 'gmi')
            if (item.Name.match(reg)) match++
          })

          if (match === searchTerms.length) return item
        })

        const sorted = []

        // If user specified a -type filer
        if (filter) {
          results = results.filter((i) => {
            switch (filter) {
              // If user wants only directories
              case 'folder':
              case 'dir': {
                return i.IsDir
              }
              default: {
                // Get file extension
                const extension = path.extname(i.Name)
                // If user specified a file extension
                // Guessing that it will start with .
                if (filter.startsWith('.')) {
                  // If extension matches filter return it
                  if (filter === extension) return true
                }
              }
            }
          })
        }

        // Remake array with nice emojis based on file extensions
        results.forEach((i) => {
          if (i.IsDir) {
            sorted.push(
              `:file_folder: [${i.Name}](https://drive.google.com/drive/u/0/folders/${i.ID})`
            )
          } else {
            switch (i.Name.split('.').pop()) {
              case 'png':
              case 'jpg':
              case 'jpeg':
                sorted.push(
                  `:frame_photo: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`
                )
                break
              case 'mkv':
              case 'mp4':
              case 'avi':
                sorted.push(
                  `:tv: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`
                )
                break
              case 'mp3':
              case 'flac':
                sorted.push(
                  `:musical_note: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`
                )
                break
              default:
                sorted.push(
                  `:newspaper: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`
                )
            }
          }
        })

        const splitArray = arraySplitter(sorted)

        const embedList = []
        Object.keys(splitArray).forEach((key, index) => {
          embedList.push(
            embed(msg, 'blue', 'rclone.gif')
              .setTitle(`Rclone Search - [ ${remote} ]`)
              .addField('Results', `${splitArray[index].join('\n')}`)
              .setDescription(
                `Total results [ ${sorted.length} ]\nUsing filter [ ${filter} ]`
              )
          )
        })

        if (!embedList.length) {
          return warningMessage(
            msg,
            `No results for search term [ ${searchTerms.join(' ')} ]`
          )
        }

        await waitMessage.delete()
        return channel.send(paginate(msg, embedList))
      }
      case 'list': {
        const e = embed(msg, 'blue', 'rclone.gif')
          .setTitle('RClone Remotes')
          .setDescription(`**- ${remotes.join('\n- ')}**`)
        return channel.send(e)
      }
      case 'size': {
        const resp = args.join().split(':')
        const remote = resp[0]
        const dirPath = resp.length >= 2 ? resp[1] : '/'

        if (!remotes.includes(remote)) {
          return errorMessage(
            msg,
            `Remote [ ${remote} ] doesn't exist in RClone config`
          )
        }

        const waitMessage = (await channel.send(
          embed(msg, 'yellow', 'rclone.gif')
            .setDescription(`**Calculating size of

          [ ${remote}:${dirPath || '/'} ]

          :hourglass: This may take some time...**`)
        )) as Message

        const startTime = performance.now()

        const { code, stdout } = await execAsync(
          `rclone size --json "${remote}":"${dirPath}" --config="${configPath}"`,
          {
            silent: true
          }
        )

        await waitMessage.delete()

        const stopTime = performance.now()

        // 3 doesnt exist 0 good

        if (code === 0) {
          const response = JSON.parse(stdout)
          const { count } = response
          const size = bytesToSize(response.bytes)

          // Handle setting channel names to size of remote
          await handleChannelStats(remote, size)

          return msg.reply(
            embed(msg, 'blue', 'rclone.gif')
              .setTitle(remote)
              .addField('Path', `${dirPath || '/'}`)
              .addField('Files', `:newspaper: ${count}`, true)
              .addField('Size', `:file_folder: ${size}`, true)
              .addField(
                'Scan Time',
                millisecondsToTime(stopTime - startTime),
                true
              )
          )
        }

        if (code === 3) {
          return warningMessage(
            msg,
            `Directory [ ${dirPath} ] in remote [ ${remote} ] doesn't exist!`
          )
        }

        return errorMessage(msg, `A error occurred with Rclone`)
      }
      case 'sizeof': {
        const driveSizeChannel = guild.channels.get(
          '664102340621500416'
        ) as GuildChannel

        const toScan = args

        for (const r of toScan) {
          if (!remotes.includes(r)) {
            return warningMessage(
              msg,
              `Remote [ ${r} ] isn't in your provided Rclone config`
            )
          }
        }

        let totalSize = 0

        const startTime = performance.now()

        const waitMessage = (await msg.channel.send(
          embed(msg, 'blue', 'rclone.gif')
            .setTitle('Scanning configured remotes')
            .addField('Currently Scanning', toScan[0])
        )) as Message

        const scannedRemotes: string[] = []

        for (const remote of toScan) {
          delete toScan[remote]

          await waitMessage.edit(
            embed(msg, 'blue', 'rclone.gif')
              .setTitle('Scanning configured remotes')
              .addField('Currently Scanning', remote)
              .addField(
                'Remaining',
                `${toScan.length ? toScan.join(', ') : '--'}`
              )
              .addField(
                'Scanned',
                `${scannedRemotes.length ? scannedRemotes.join(', ') : '--'}`
              )
              .addField('Total Size So Far', bytesToSize(totalSize))
          )
          scannedRemotes.push(remote)

          const { code, stdout } = await execAsync(
            `rclone size --json "${remote}:/" --config="${configPath}" --fast-list`,
            {
              silent: true
            }
          )

          if (code === 0) {
            totalSize += JSON.parse(stdout).bytes
            // Handle setting channel names to size of remote
            await handleChannelStats(
              remote,
              bytesToSize(JSON.parse(stdout).bytes)
            )
          }
        }

        if (driveSizeChannel) {
          await driveSizeChannel.setName(
            `📁size ${bytesToSize(totalSize)
              .replace('.', '_')
              .replace(' ', '\u2009\u2009\u2009')}`
          )
        }

        const stopTime = performance.now()
        return waitMessage.edit(
          embed(msg, 'blue', 'rclone.gif')
            .setTitle('Rclone Size Scan Complete')
            .addField('Total Size', bytesToSize(totalSize))
            .addField('Completed In', millisecondsToTime(stopTime - startTime))
        )
      }
      case 'ls': {
        const resp = args.join().split(':')
        const remote = resp[0]
        const dirPath = resp.length >= 2 ? resp[1] : '/'

        if (!remotes.includes(remote)) {
          return errorMessage(
            msg,
            `Remote [ ${remote} ] doesn't exist in RClone config`
          )
        }

        const waitMessage = (await channel.send(
          embed(msg, 'yellow', 'rclone.gif').setDescription(
            `**Getting Directory

          [ ${remote}:${dirPath || '/'} ]

          :hourglass: This may take some time...**`
          )
        )) as Message

        const { code, stdout } = await execAsync(
          `rclone lsjson "${remote}":"${dirPath}" --config="${configPath}"`,
          {
            silent: true
          }
        )

        await waitMessage.delete()
        // 3 doesnt exist 0 good

        if (code === 0) {
          let response = JSON.parse(stdout)

          // Handle folder being empty
          if (!response.length) {
            return standardMessage(
              msg,
              'green',
              `:file_cabinet: [ ${remote}:${dirPath || '/'} ] is empty`
            )
          }

          const sorted = []
          // Remake array with nice emojis based on file extensions
          response.forEach((i) => {
            if (i.IsDir) {
              sorted.push(`:file_folder: ${i.Name}`)
            } else {
              switch (i.Name.split('.').pop()) {
                case 'png':
                case 'jpg':
                case 'jpeg':
                  sorted.push(`:frame_photo: ${i.Name}`)
                  break
                case 'mkv':
                case 'mp4':
                case 'avi':
                  sorted.push(`:tv: ${i.Name}`)
                  break
                case 'mp3':
                case 'flac':
                  sorted.push(`:musical_note: ${i.Name}`)
                  break
                default:
                  sorted.push(`:newspaper: ${i.Name}`)
              }
            }
          })

          response = sorted.join()
          const splitArray = arraySplitter(sorted)

          const embedList = []
          Object.keys(splitArray).forEach((key, index) => {
            embedList.push(
              embed(msg, 'blue', 'rclone.gif')
                .setTitle(remote)
                .addField('Path', `${dirPath || '/'}`)
                .addField('Files', `${splitArray[index].join('\n')}`)
            )
          })

          return paginate(msg, embedList)
        }

        if (code === 3) {
          return warningMessage(
            msg,
            `Directory [ ${dirPath} ] in remote [ ${remote} ] doesn't exist!`
          )
        }

        return errorMessage(msg, 'A error occurred with RClone')
      }
      default:
        return validOptions(msg, ['ls', 'size', 'list', 'find'])
    }
  }
}
