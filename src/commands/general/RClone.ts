/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { ExecAsync, NezukoMessage } from 'typings'

import { Message } from 'discord.js'
import { existsSync } from 'fs'
import { performance } from 'perf_hooks'
import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class RClone extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'rclone',
      category: 'General',
      aliases: ['drive'],
      description: 'Get info on RClone remotes',
      usage: [
        'rclone list',
        'rclone size <remote>:/<dir>',
        'rclone ls <remote>:/<dir>',
        'rclone sizeof <remote1> <remote2> <remote3> <remote4>'
      ],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils } = client
    const { channel } = msg

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
    const { code: c, stdout: o } = (await execAsync(`rclone listremotes --config=${configPath}`, {
      silent: true
    })) as ExecAsync

    if (c !== 0) return errorMessage(msg, `A error occured with Rclone`)

    const remotes = o
      .replace(/:/g, '')
      .split('\n')
      .filter(Boolean)

    // * ------------------ Logic --------------------

    const command = args.shift()

    switch (command) {
      case 'list': {
        const e = embed('blue', 'rclone.gif')
          .setTitle('RClone Remotes')
          .setDescription(`**- ${remotes.join('\n- ')}**`)
        return channel.send(e)
      }
      case 'size': {
        const resp = args.join().split(':')
        const remote = resp[0]
        const dirPath = resp.length >= 2 ? resp[1] : '/'

        if (!remotes.includes(remote)) {
          return errorMessage(msg, `Remote [ ${remote} ] doesn't exist in RClone config`)
        }

        const waitMessage = (await channel.send(
          embed('yellow', 'rclone.gif').setDescription(`**Calculating size of

          [ ${remote}:${dirPath || '/'} ]

          :hourglass: This may take some time...**`)
        )) as Message

        const startTime = performance.now()

        const { code, stdout } = (await execAsync(
          `rclone size --json "${remote}":"${dirPath}" --config="${configPath}"`,
          {
            silent: true
          }
        )) as ExecAsync

        await waitMessage.delete()

        const stopTime = performance.now()

        // 3 doesnt exist 0 good

        if (code === 0) {
          const response = JSON.parse(stdout)
          const { count } = response
          const size = bytesToSize(response.bytes)

          return msg.reply(
            embed('blue', 'rclone.gif')
              .setTitle(`[ ${remote}:${dirPath || '/'} ]`)
              .addField('Files', `:newspaper: ${count}`, true)
              .addField('Size', `:file_folder: ${size}`, true)
              .addField('Scan Time', millisecondsToTime(stopTime - startTime), true)
          )
        }

        if (code === 3) {
          return warningMessage(
            msg,
            `Directory [ ${dirPath} ] in remote [ ${remote} ] doesn't exist!`
          )
        }

        return errorMessage(msg, `A error occured with Rclone`)
      }
      case 'sizeof': {
        for (const remote of args) {
          if (!remotes.includes(remote)) {
            return errorMessage(msg, `Remote [ ${remote} ] doesn't exist in RClone config`)
          }
        }

        const waitMessage = (await channel.send(
          embed('yellow', 'rclone.gif').setDescription(`**Calculating size of

          [ ${args.join(', ')} ]

          :hourglass: This is going to take a while...**`)
        )) as Message

        const startTime = performance.now()

        let totalSize = 0
        let totalFiles = 0

        for (const remote of args) {
          const { code, stdout } = (await execAsync(
            `rclone size --json "${remote}:/" --config="${configPath}"`,
            {
              silent: true
            }
          )) as ExecAsync

          if (code === 0) {
            const response = JSON.parse(stdout)
            const { count, bytes } = response

            totalSize += bytes
            totalFiles += count
          }
        }

        await waitMessage.delete()

        const stopTime = performance.now()

        return msg.reply(
          embed('blue', 'rclone.gif')
            .setTitle('Rclone Batch Scan')
            .addField('Scanned Remotes', `${args.join(', ')}`)
            .addField('Files', `:newspaper: ${totalFiles}`, true)
            .addField('Size', `:file_folder: ${bytesToSize(totalSize)}`, true)
            .addField('Scan Time', millisecondsToTime(stopTime - startTime), true)
        )
      }
      case 'ls': {
        const resp = args.join().split(':')
        const remote = resp[0]
        const dirPath = resp.length >= 2 ? resp[1] : '/'

        if (!remotes.includes(remote)) {
          return errorMessage(msg, `Remote [ ${remote} ] doesn't exist in RClone config`)
        }

        const waitMessage = (await channel.send(
          embed('yellow', 'rclone.gif').setDescription(
            `**Getting Directory

          [ ${remote}:${dirPath || '/'} ]

          :hourglass: This may take some time...**`
          )
        )) as Message

        const { code, stdout } = (await execAsync(
          `rclone lsjson "${remote}":"${dirPath}" --config="${configPath}"`,
          {
            silent: true
          }
        )) as ExecAsync

        await waitMessage.delete()
        // 3 doesnt exist 0 good

        if (code === 0) {
          let response = JSON.parse(stdout)

          // Handle folder being empty
          if (!response.length) {
            return standardMessage(msg, `:file_cabinet: [ ${remote}:${dirPath || '/'} ] is empty`)
          }

          const sorted = []
          // Remake array with nice emojis based on file extensions
          response.forEach((i) => {
            if (i.IsDir) sorted.push(`:file_folder: ${i.Name}`)
            else {
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
              embed('blue', 'rclone.gif')
                .setTitle(`[ ${remote}:${dirPath || '/'} ]`)
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

        return errorMessage(msg, 'A error occured with RClone')
      }
      default:
        return validOptions(msg, ['ls', 'size', 'list'])
    }
  }
}
