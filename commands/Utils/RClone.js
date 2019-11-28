const { exec } = require('shelljs')
const { performance } = require('perf_hooks')
const Command = require('../../core/Command')

module.exports = class RClone extends Command {
  constructor(client) {
    super(client, {
      name: 'rclone',
      category: 'Utils',
      description: 'Gets info on the Rclone folder you specify',
      usage: ['rclone size /Unsorted', 'rclone ls /folder/to/check'],
      args: true,
      aliases: ['drive']
    })
  }

  async run(client, msg, args) {
    const { Utils, p } = client

    const {
      errorMessage,
      warningMessage,
      validOptions,
      standardMessage,
      embed,
      bytesToSize,
      millisecondsToTime,
      arraySplitter,
      paginate
    } = Utils

    const { channel } = msg

    const { remote } = client.db.config.rclone
    if (!remote) {
      const settings = [`${p}db set rclone remote <remote>`]
      return channel.send(
        embed(msg, 'red')
          .setTitle(':gear: Missing Rclone DB config!')
          .setDescription(`Set them like so..\n\`\`\`css\n${settings.join('\n')}\n\`\`\``)
      )
    }

    const command = args.shift()
    const dirPath = args.join(' ')

    const caseOptions = ['ls', 'size']
    switch (command) {
      case 'size': {
        const waitMessage = await standardMessage(
          msg,
          `:file_cabinet: Calculating size of

          - ${dirPath || '/'}

            :hourglass: This may take some time...`
        )

        const startTime = performance.now()

        exec(
          `rclone size --json ${remote}:"${dirPath}"`,
          {
            silent: true
          },
          async (code, stdout) => {
            await waitMessage.delete()
            const stopTime = performance.now()
            // 3 doesnt exist 0 good

            if (code === 0) {
              const response = JSON.parse(stdout)
              const { count } = response
              const size = bytesToSize(response.bytes)

              return msg.reply(
                embed(msg)
                  .setTitle(`:file_cabinet: GDrive Directory:\n- ${dirPath}`)
                  .addField('Files', `:newspaper: ${count}`, true)
                  .addField('Size', `:file_folder: ${size}`, true)
                  .setDescription(`**Time Taken ${millisecondsToTime(stopTime - startTime)}**`)
              )
            }

            if (code === 3) {
              return warningMessage(msg, `Directory | :file_folder: ${dirPath} | does not exist!`)
            }

            return errorMessage(msg, `A error occured with Rclone`)
          }
        )
        break
      }

      case 'ls': {
        const waitMessage = await standardMessage(
          msg,
          `:file_cabinet: Getting Directory

          - ${dirPath || '/'}

          :hourglass: This may take some time...`
        )

        exec(
          `rclone lsjson ${remote}:"${dirPath}"`,
          {
            silent: true
          },
          async (code, stdout) => {
            await waitMessage.delete()
            // 3 doesnt exist 0 good

            if (code === 0) {
              let response = JSON.parse(stdout)
              const sorted = []
              // remake array with nice emojis based on file extensions
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
                  embed(msg)
                    .setTitle(`:file_cabinet: ${dirPath || '/'}`)
                    .setThumbnail(
                      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_Drive_logo.png/600px-Google_Drive_logo.png'
                    )
                    .addField('Files', `${splitArray[index].join('\n')}`)
                )
              })

              return paginate(msg, embedList)
            }

            if (code === 3) {
              return warningMessage(
                msg,
                `Folder | :file_folder: ${dirPath || '/'} | does not exist! `
              )
            }

            return errorMessage(msg, 'A error occured with RClone')
          }
        )
        break
      }
      default:
        return validOptions(msg, caseOptions)
    }
  }
}
