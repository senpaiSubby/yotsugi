const { performance } = require('perf_hooks')
const { existsSync } = require('fs')
const Command = require('../../core/Command')

module.exports = class RClone extends Command {
  constructor(client) {
    super(client, {
      name: 'rclone',
      category: 'General',
      description: 'Get info on RClone directories',
      usage: ['rclone size /Unsorted', 'rclone ls /folder/to/check'],
      args: true,
      aliases: ['drive']
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, p } = client
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
      missingConfig,
      execAsync
    } = Utils

    // * ------------------ Config --------------------

    const { remote } = client.db.config.rclone
    const configPath = `${__dirname}/../../config/rclone.conf`

    // * ------------------ Check Config --------------------

    if (!existsSync(configPath)) {
      return errorMessage(
        msg,
        `RClone config is missing!

        Place your \`rclone.conf\` file inside the \`config\` directory of Nezuko!`
      )
    }

    if (!remote) {
      const settings = [`${p}config set rclone remote <remote>`]
      return missingConfig(msg, 'rclone', settings)
    }

    // * ------------------ Logic --------------------

    const command = args.shift()
    const dirPath = args.join(' ')

    switch (command) {
      case 'size': {
        const waitMessage = await channel.send(
          embed('yellow', 'rclone.gif').setDescription(`**:file_cabinet: Calculating size of

          ${remote.toUpperCase()}:${dirPath || '/'}

          :hourglass: This may take some time...**`)
        )

        const startTime = performance.now()
        const { code, stdout } = await execAsync(
          `rclone size --json ${remote}:"${dirPath}" --config=${configPath}`,
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

          return msg.reply(
            embed('green', 'rclone.gif')
              .setTitle(
                `:file_cabinet: GDrive Directory:\n${remote.toUpperCase()}:${dirPath || '/'}`
              )
              .addField('Files', `:newspaper: ${count}`, true)
              .addField('Size', `:file_folder: ${size}`, true)
              .setDescription(`**Time Taken ${millisecondsToTime(stopTime - startTime)}**`)
          )
        }

        if (code === 3) {
          return warningMessage(
            msg,
            `Directory [ ${remote.toUpperCase()}:${dirPath} ] does not exist!`
          )
        }

        return errorMessage(msg, `A error occured with Rclone`)
      }

      case 'ls': {
        const waitMessage = await channel.send(
          embed('yellow', 'rclone.gif').setDescription(
            `**:file_cabinet: Getting Directory

          ${remote.toUpperCase()}:${dirPath || '/'}

          :hourglass: This may take some time...**`
          )
        )

        const { code, stdout } = await execAsync(
          `rclone lsjson ${remote}:"${dirPath}" --config=${configPath}`,
          {
            silent: true
          }
        )

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
              embed('green', 'rclone.gif')
                .setTitle(`:file_cabinet: ${remote.toUpperCase()}:${dirPath || '/'}`)
                .addField('Files', `${splitArray[index].join('\n')}`)
            )
          })

          return paginate(msg, embedList)
        }

        if (code === 3) {
          return warningMessage(
            msg,
            `Directory [ ${remote.toUpperCase()}:${dirPath || '/'} ] does not exist`
          )
        }

        return errorMessage(msg, 'A error occured with RClone')
      }
      default:
        return validOptions(msg, ['ls', 'size'])
    }
  }
}
