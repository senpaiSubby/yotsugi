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
import { Utils } from '../../core/Utils'

/**
 * Command to view, search and get information from your rclone remotes
 */
export default class RClone extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['drive'],
      args: true,
      category: 'DL & File Management',
      description: 'Search and get info from RClone',
      name: 'rclone',
      usage: [
        'rclone list',
        'rclone size [remote]:/[dir]',
        'rclone ls [remote]:/[dir]',
        'rclone sizeof [remote1] [remote2] [remote3] [remote4]',
        'rclone find [remote] [search terms]',
        'rclone find [remote] [search terms] -filter [dir or file extension]'
      ]
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
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

    // Load rclone config
    const configPath = `${__dirname}/../../config/rclone.conf`

    // Check if rclone config exists
    if (!existsSync(configPath)) {
      return warningMessage(
        msg,
        `RClone config is missing!
        Place your \`rclone.conf\` file inside the \`/build/config\` directory of Nezuko!`
      )
    }

    /**
     * Fetches and parses remotes from rclone config
     */
    const fetchRemotes = async () => {
      const { code, stdout } = await execAsync(`rclone listremotes --config='${configPath}'`, {
        silent: true
      })

      if (code !== 0) return false

      return stdout
        .replace(/:/g, '')
        .split('\n')
        .filter(Boolean)
    }

    // Fetch rclone remotes from config
    const remotes = await fetchRemotes()

    // If no remotes or config is invalid
    if (!remotes) return errorMessage(msg, 'A error occurred with Rclone')

    /**
     * TODO make this customizable via the rclone command
     * @param remote Rclone remote
     * @param size Size to be displayed in channel name
     */
    const handleChannelStats = async (remote: string, size: string) => {
      switch (remote) {
        case 'AnimeDrive': {
          const channelToName = client.channels.cache.get('666705180250865678') as GuildChannel
          if (channelToName) await channelToName.setName(`ᴛᴅ sɪᴢᴇ: ${size}`)
        }
      }
    }

    // Fetch command from user args
    const command = args.shift()

    switch (command) {
      // Find filed in a rclone remote
      case 'find': {
        // Target rclone remote
        const remote = args.shift()

        // Search arguments
        const searchTerms = args

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
              'You specified a blank filter. Correct usage would be like `-type folder` or `-type .mp4`'
            )
          }
        }

        // If user doesn't specify what to search for
        if (!searchTerms.length) {
          return warningMessage(msg, 'Please specify what you want to search for')
        }

        // If remote doesn't exist in rclone config
        if (!remotes.includes(remote)) {
          return errorMessage(msg, `[ ${remote} ] isn't a valid rclone remote`)
        }

        // Send a wait message while parsing results
        const waitMessage = await channel.send(
          embed(msg, 'yellow', 'rclone.gif').setDescription(
            `**Searching [ ${remote} ] for [ ${searchTerms.join(' ')} ]**`
          )
        )

        // Load rclone cache from database
        const db = await database.models.RcloneCache.findOne({
          where: { id: remote }
        })

        // If cache exists in database
        if (db) {
          // Load cache
          const data = JSON.parse(db.get('cache') as string)

          // Filter out non matching results
          let results = data.filter((item) => {
            let match = 0

            // Result must match each search term
            searchTerms.forEach((term) => {
              const reg = new RegExp(term, 'gmi')
              if (item.Name.match(reg)) match++
            })

            // If it does then return result
            if (match === searchTerms.length) return item
          })

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

          // Array for cleaned results for embed list
          const prettified = []

          // Remake array with nice emojis based on file extensions
          results.forEach((i) => {
            if (i.IsDir) {
              prettified.push(`:file_folder: [${i.Name}](https://drive.google.com/drive/u/0/folders/${i.ID})`)
            } else {
              switch (i.Name.split('.').pop()) {
                case 'png':
                case 'jpg':
                case 'jpeg':
                  prettified.push(`:frame_photo: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`)
                  break
                case 'mkv':
                case 'mp4':
                case 'avi':
                  prettified.push(`:tv: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`)
                  break
                case 'mp3':
                case 'flac':
                  prettified.push(`:musical_note: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`)
                  break
                default:
                  prettified.push(`:newspaper: [${i.Name}](https://drive.google.com/file/d/${i.ID}/view)`)
              }
            }
          })

          // Split array to fit within discord 2k character limit
          const splitArray = arraySplitter(prettified)

          // Generat embed list
          const embedList = Object.keys(splitArray).map((key, index) =>
            embed(msg, 'blue', 'rclone.gif')
              .setTitle(`Rclone Search - [ ${remote} ]`)
              .addField('Results', `${splitArray[index].join('\n')}`)
              .setDescription(`Total results [ ${prettified.length} ]${filter ? `\nUsing filter [ ${filter} ]` : ''}`)
          )

          // If embed list is empty there were no results
          if (!embedList.length) {
            return warningMessage(msg, `No results for search term [ ${searchTerms.join(' ')} ]`)
          }

          // Delete wait message
          await waitMessage.delete()

          // Send results
          return channel.send(paginate(msg, embedList))
        }

        // If database entry doesn't exist for remote a cache hasn't been completed yet
        return errorMessage(
          msg,
          `No cache has been run for remote [ ${remote} ]. One will be generated soon. Please try again later.`
        )
      }
      // List remotes from rclone config
      case 'list': {
        // Return rclone remotes
        return channel.send(
          embed(msg, 'blue', 'rclone.gif')
            .setTitle('RClone Remotes')
            .setDescription(`**- ${remotes.join('\n- ')}**`)
        )
      }
      // Finds size of rclone remote
      // TODO directories with spaces result in error
      case 'size': {
        // Parse remote and path from args
        const resp = args.join().split(':')
        const remote = resp[0]
        const dirPath = resp.length >= 2 ? resp[1] : '/'

        // If remote doesn't exist in config
        if (!remotes.includes(remote)) {
          return errorMessage(msg, `[ ${remote} ] isn't a valid rclone remote`)
        }

        // Send wait message
        const waitMessage = await channel.send(
          embed(msg, 'yellow', 'rclone.gif').setDescription(`**Calculating size of

          [ ${remote}:${dirPath || '/'} ]

          :hourglass: This may take some time...**`)
        )

        // Start time timestamp
        const startTime = performance.now()

        // List all files in directory
        const { code, stdout } = await execAsync(
          `rclone size --json "${remote}":"${dirPath}" --config="${configPath}"`,
          {
            silent: true
          }
        )

        // Remove wait message
        await waitMessage.delete()

        // End time timestamp
        const stopTime = performance.now()

        // 3 doesnt exist 0 good

        // If exist code is good
        if (code === 0) {
          // Pasrse json output
          const response = JSON.parse(stdout)
          const { count } = response
          // Convert size from bytes to readable format
          const size = bytesToSize(response.bytes)

          // Handle setting channel names to size of remote
          await handleChannelStats(remote, size)

          // Return size of directory
          return msg.reply(
            embed(msg, 'blue', 'rclone.gif')
              .setTitle(remote)
              .addField('Path', `${dirPath || '/'}`)
              .addField('Files', `:newspaper: ${count}`, true)
              .addField('Size', `:file_folder: ${size}`, true)
              .addField('Scan Time', millisecondsToTime(stopTime - startTime), true)
          )
        }

        // If code is 3 then the path doesnt exist in config
        if (code === 3) {
          return warningMessage(msg, `Directory [ ${dirPath} ] in remote [ ${remote} ] doesn't exist!`)
        }

        // If command failed
        return errorMessage(msg, 'A error occurred with Rclone')
      }

      // Find size of multiple remotes
      case 'sizeof': {
        // Remotes to scan
        const toScan = args

        // Check that each remote is in config file
        for (const remote of toScan) {
          if (!remotes.includes(remote)) {
            return warningMessage(msg, `Remote [ ${remote} ] isn't in your provided Rclone config`)
          }
        }

        // Total byte size count
        let totalSize = 0

        // Start time
        const startTime = performance.now()

        // Initial wait message
        const waitMessage = await msg.channel.send(
          embed(msg, 'blue', 'rclone.gif')
            .setTitle('Scanning configured remotes')
            .addField('Currently Scanning', toScan[0])
        )

        // List of remotes already scanned
        const scannedRemotes: string[] = []

        // Scan each remote
        for (const remote of toScan) {
          // Remove remote from toScan list
          delete toScan[remote]

          // Edit wait message with updated info when a scan is complete
          await waitMessage.edit(
            embed(msg, 'blue', 'rclone.gif')
              .setTitle('Scanning configured remotes')
              .addField('Currently Scanning', remote)
              .addField('Remaining', `${toScan.length ? toScan.join(', ') : '--'}`)
              .addField('Scanned', `${scannedRemotes.length ? scannedRemotes.join(', ') : '--'}`)
              .addField('Total Size So Far', bytesToSize(totalSize))
          )

          // Add remote to Scanned remoted
          scannedRemotes.push(remote)

          // Fetch size of remte
          const { code, stdout } = await execAsync(
            `rclone size --json "${remote}:/" --config="${configPath}" --fast-list`,
            {
              silent: true
            }
          )

          // If exit code id good
          if (code === 0) {
            // Add new size with total size
            totalSize += JSON.parse(stdout).bytes
          }
        }

        // Ending timestamp
        const stopTime = performance.now()

        // Update waitmessage when all scans are complete with total sizes
        return waitMessage.edit(
          embed(msg, 'blue', 'rclone.gif')
            .setTitle('Rclone Size Scan Complete')
            .addField('Total Size', bytesToSize(totalSize))
            .addField('Completed In', millisecondsToTime(stopTime - startTime))
        )
      }
      // List contents of rclone directories
      case 'ls': {
        // Parse remote and directory from args
        const resp = args.join().split(':')
        const remote = resp[0]
        const dirPath = resp.length >= 2 ? resp[1] : '/'

        // If remote doesnt exist is config
        if (!remotes.includes(remote)) {
          return errorMessage(msg, `[ ${remote} ] isn't a valid rclone remote`)
        }

        // Send wait message
        const waitMessage = await channel.send(
          embed(msg, 'yellow', 'rclone.gif').setDescription(
            `**Getting Directory

          [ ${remote}:${dirPath || '/'} ]

          :hourglass: This may take some time...**`
          )
        )

        // List files in target remote and dir
        const { code, stdout } = await execAsync(`rclone lsjson "${remote}":"${dirPath}" --config="${configPath}"`, {
          silent: true
        })

        // Remove wait message
        await waitMessage.delete()
        // 3 doesnt exist 0 good

        // If exit code is good
        if (code === 0) {
          // Parse output
          const response = JSON.parse(stdout)

          // Handle folder being empty
          if (!response.length) {
            return standardMessage(msg, 'green', `:file_cabinet: [ ${remote}:${dirPath || '/'} ] is empty`)
          }

          // Remake array with nice emojis based on file extensions
          const sorted = response.map((i) => {
            if (i.IsDir) {
              return `:file_folder: ${i.Name}`
            }
            switch (i.Name.split('.').pop()) {
              case 'png':
              case 'jpg':
              case 'jpeg':
                return `:frame_photo: ${i.Name}`

              case 'mkv':
              case 'mp4':
              case 'avi':
                return `:tv: ${i.Name}`

              case 'mp3':
              case 'flac':
                return `:musical_note: ${i.Name}`

              default:
                return `:newspaper: ${i.Name}`
            }
          })

          // Split array to fit under discords 2k character limit
          const splitArray = arraySplitter(sorted)

          // Generate embed list
          const embedList = Object.keys(splitArray).map((key, index) =>
            embed(msg, 'blue', 'rclone.gif')
              .setTitle(remote)
              .addField('Path', `${dirPath || '/'}`)
              .addField('Files', `${splitArray[index].join('\n')}`)
          )

          // Return results
          return paginate(msg, embedList)
        }

        // If target directory doesnt exit in remote
        if (code === 3) {
          return warningMessage(msg, `Directory [ ${dirPath} ] in remote [ ${remote} ] doesn't exist!`)
        }

        // If rclone failed to run
        return errorMessage(msg, 'A error occurred with RClone')
      }
      // If user doesnt choose and of the above options inform them
      default:
        return validOptions(msg, ['ls', 'size', 'list', 'find'])
    }
  }
}
