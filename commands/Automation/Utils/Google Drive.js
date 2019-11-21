const { exec } = require('shelljs')
const { performance } = require('perf_hooks')
const Command = require('../../../core/Command')

class Drive extends Command {
  constructor(client) {
    super(client, {
      name: 'drive',
      category: 'Utils',
      description: 'Gets info on the gdrive folder you specify',
      usage: 'drive size /Unsorted | drive ls /folder/to/check',
      args: true,
      permsNeeded: ['ADMINISTRATOR']
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { author, channel } = msg

    const { remote } = JSON.parse(client.settings.rclone)

    const command = args.shift()
    const dirPath = args.join(' ')

    switch (command) {
      case 'size': {
        const editMessage = await channel.send(
          Utils.embed(msg, 'green')
            .setTitle(`:file_cabinet: Checking folder size of\n- **${dirPath}**`)
            .setDescription(`:hourglass: This may take some time...`)
        )

        const startTime = performance.now()
        exec(
          `rclone size --json ${remote}:"${dirPath}"`,
          { silent: true },
          async (code, stdout) => {
            await editMessage.delete()
            const stopTime = performance.now()
            // 3 doesnt exist 0 good
            const embed = Utils.embed(msg, 'green')
            if (code === 0) {
              const response = JSON.parse(stdout)
              const { count } = response
              const size = Utils.bytesToSize(response.bytes)
              embed.setTitle(`:file_cabinet: GDrive Directory:\n- ${dirPath}`)
              embed.addField('Files', `:newspaper: ${count}`)
              embed.addField('Size', `:file_folder: ${size}`)
              embed.setDescription(`Time Taken ${Utils.millisecondsToTime(stopTime - startTime)}`)

              return msg.reply({ embed })
            }

            if (code === 3) {
              embed.setTitle(`Directory | :file_folder: ${dirPath} | does not exist! `)
              embed.setColor(client.colors.yellow)
              const m = await msg.reply({ embed })
              return m.delete(10000)
            }

            const m = await msg.reply(
              Utils.embed(msg, 'red').setDescription('A error occured with Rclone')
            )
            return m.delete(10000)
          }
        )
        break
      }

      case 'ls': {
        const editMessage = await channel.send(
          Utils.embed(msg, 'green')
            .setTitle(`:file_cabinet: Directory\n- **${dirPath}**`)
            .setDescription(`:hourglass:  This may take some time...`)
        )
        exec(`rclone lsjson ${remote}:"${dirPath}"`, { silent: true }, async (code, stdout) => {
          // 3 doesnt exist 0 good

          if (code === 0) {
            let response = JSON.parse(stdout)
            const sorted = []
            // remake array with nice emojis based on file extensions
            for (const i of response) {
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
            }

            response = sorted.join()
            // initial page size
            let pageSize = 40
            // split array into multiple even arrays
            let totalPages = Utils.chunkArray(sorted, pageSize)
            // dynamically adjust page size based on length of each array
            let willFit = false
            while (!willFit) {
              let sizeInRange = true
              // eslint-disable-next-line no-loop-func
              totalPages.forEach((i) => {
                if (i.join().length > 1024) {
                  sizeInRange = false
                }
              })
              if (sizeInRange) willFit = true
              pageSize--
              totalPages = Utils.chunkArray(sorted, pageSize)
            }

            // start page at 0
            let page = 0
            let run = true
            // run our loop to wait for user input
            while (run) {
              const embed = Utils.embed(msg, 'green')
                .setTitle(`:file_cabinet: ${dirPath}`)
                .setDescription(
                  `:page_facing_up: ${page + 1}/${totalPages.length} | :card_box: ${
                    sorted.length
                  } | Page Size ${pageSize}`
                )
                .setThumbnail(
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_Drive_logo.png/600px-Google_Drive_logo.png'
                )
                .addField('Files', totalPages[page].join('\n'))
              await editMessage.edit({ embed })

              if (totalPages.length !== 1) {
                if (page === 0) {
                  await editMessage.react('➡️')
                } else if (page + 1 === totalPages.length) {
                  await editMessage.react('⬅️')
                } else {
                  await editMessage.react('⬅️')
                  await editMessage.react('➡️')
                }
              }

              const collected = await editMessage.awaitReactions(
                (reaction, user) =>
                  ['⬅️', '➡️'].includes(reaction.emoji.name) &&
                  user.id === author.id &&
                  user.id !== client.user.id,
                { max: 1, time: 120000 }
              )
              const reaction = collected.first()
              if (reaction) {
                await editMessage.clearReactions()

                switch (reaction.emoji.name) {
                  case '⬅️':
                    page--
                    break
                  case '➡️':
                    page++
                    break
                  default:
                    break
                }
              } else {
                run = false
              }
              await editMessage.clearReactions()
            }
            return
          }

          if (code === 3) {
            const embed = Utils.embed(msg, 'yellow')
            embed.setTitle(`Folder | :file_folder: ${dirPath} | does not exist! `)
            const m = await channel.send({ embed })
            return m.delete(10000)
          }

          return channel.send(Utils.embed(msg, 'red').setDescription('A error occured with RClone'))
        })
        break
      }
      default: {
        const m = await channel.send(
          Utils.embed(msg, 'yellow').setDescription('Valid options are [ls] or [size].')
        )
        m.delete(10000)
      }
    }
  }
}
module.exports = Drive
