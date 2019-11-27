const { readdir } = require('fs')
const Command = require('../../core/Command')

module.exports = class ImgReactions extends Command {
  constructor(client) {
    super(client, {
      name: 'img',
      category: 'Fun',
      description: 'Gif image reactions',
      usage: ['img list', 'img wow'],
      guildOnly: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    //* -------------------------- Setup --------------------------
    const { Utils } = client
    const { embed } = Utils
    const { author, channel } = msg
    if (!api) msg.delete()

    //* ------------------------- Config --------------------------

    const imgDir = 'data/images/reactions'

    //* ----------------------- Main Logic ------------------------

    const listImages = async () => {
      const files = await readdir(imgDir)
      const fileList = []
      if (files) {
        files.forEach((file) => {
          const baseName = file.split('.').shift()
          fileList.push(baseName)
        })
        return fileList
      }
      return false
    }

    const findImage = async (searchTerm) => {
      const files = await readdir(imgDir)
      if (files) {
        files.forEach((file) => {
          const ext = file.split('.').pop()
          const baseName = file.split('.').shift()

          if (baseName === searchTerm) return [`${imgDir}/${baseName}.${ext}`, file]
        })
      }

      return false
    }

    //* ---------------------- Usage Logic ------------------------

    const e = embed(msg)

    switch (args[0]) {
      case 'list': {
        const images = await listImages()
        let fileList = ''

        images.forEach((file) => (fileList += `${file}\n`))

        e.setTitle('Reaction Images')
        e.addField('Here are my images', fileList)
        const m = await channel.send(e)
        return m.delete(10000)
      }

      default: {
        const file = await findImage(args[0])
        if (file) {
          e.setTitle(`${author.username} said ${args[0]}`)
          e.attachFile(file[0])
          e.setImage(`attachment://${file[1]}`)
          return channel.send(e)
        }
        e.setTitle(`No reactions for ${args[0]}`)
        const m = await channel.send(e)
        return m.delete(10000)
      }
    }
  }
}
