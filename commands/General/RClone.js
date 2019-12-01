const { performance } = require('perf_hooks')
const Command = require('../../core/Command')

module.exports = class RClone extends Command {
  constructor(client) {
    super(client, {
      name: 'rclone',
      category: 'General',
      description: 'Gets info on the Rclone folder you specify',
      usage: ['rclone size /Unsorted', 'rclone ls /folder/to/check'],
      args: true,
      aliases: ['drive']
    })
  }

  async run(client, msg, args) {
    const { Utils, p } = client
    const { execAsync } = Utils

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
        embed('red')
          .setTitle(':gear: Missing Rclone DB config!')
          .setDescription(`Set them like so..\n\`\`\`css\n${settings.join('\n')}\n\`\`\``)
      )
    }

    const command = args.shift()
    const dirPath = args.join(' ')

    switch (command) {
      case 'size': {
        const waitMessage = await standardMessage(
          msg,
          `:file_cabinet: Calculating size of

          [ ${dirPath || '/'} ]

          :hourglass: This may take some time...`
        )

        const startTime = performance.now()

        const { code, stdout } = await execAsync(`rclone size --json ${remote}:"${dirPath}"`, {
          silent: true
        })

        await waitMessage.delete()
        const stopTime = performance.now()
        // 3 doesnt exist 0 good

        if (code === 0) {
          const response = JSON.parse(stdout)
          const { count } = response
          const size = bytesToSize(response.bytes)

          return msg.reply(
            embed('green', 'rclone.gif')
              .setTitle(`:file_cabinet: GDrive Directory:\n- [ ${dirPath} ]`)
              .addField('Files', `:newspaper: ${count}`, true)
              .addField('Size', `:file_folder: ${size}`, true)
              .setDescription(`**Time Taken ${millisecondsToTime(stopTime - startTime)}**`)
          )
        }

        if (code === 3) {
          return warningMessage(msg, `Directory [ ${dirPath} ] does not exist!`)
        }

        return errorMessage(msg, `A error occured with Rclone`)
      }

      case 'ls': {
        const waitMessage = await standardMessage(
          msg,
          `:file_cabinet: Getting Directory

          [ ${dirPath || '/'} ]

          :hourglass: This may take some time...`
        )

        const { code, stdout } = await execAsync(`rclone lsjson ${remote}:"${dirPath}"`, {
          silent: true
        })

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
                .setTitle(`:file_cabinet: [ ${dirPath || '/'} ]`)
                .addField('Files', `${splitArray[index].join('\n')}`)
            )
          })

          return paginate(msg, embedList)
        }

        if (code === 3) {
          return warningMessage(msg, `Directory [ ${dirPath || '/'} ] does not exist! `)
        }

        return errorMessage(msg, 'A error occured with RClone')
      }
      default:
        return validOptions(msg, ['ls', 'size'])
    }
  }
}
