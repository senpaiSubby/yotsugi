const torrent2magnet = require('torrent2magnet')
const { existsSync, mkdirSync, createWriteStream } = require('fs')
const { dirname } = require('path')
const fetch = require('node-fetch')
const { client } = require('../../nezuko')

module.exports = class MessageManager {
  constructor() {
    throw new Error(`${this.constructor.name} class cannot be instantiated`)
  }

  static async Logger(msg) {
    const { content, guild, author, channel, createdAt, context, attachments } = msg
    const { id, tag, username } = author
    const { serverConfig, Logger, config } = client
    const { ownerID } = config

    const runCommand = async (cmdString) => {
      const commandName = cmdString.split(' ').shift()

      const cmd = context.findCommand(commandName)
      const args = cmdString.split(' ').slice(1)
      if (cmd) return context.runCommand(client, cmd, msg, args)
    }

    const attachmentParser = async (url) => {
      const fileName = url.split('/').pop()
      const extension = fileName.split('.').pop()

      let cmd = ``

      switch (extension) {
        case 'torrent':
          cmd = `tor add ${await torrent2magnet(url)}`
          break
      }
      if (cmd) return runCommand(cmd)
    }

    const attachmentHandler = async () => {
      // check if msg contains attachments

      if (attachments) {
        attachments.forEach(async (a) => {
          const { url } = a
          await attachmentParser(url)

          try {
            const name = url.split('/').pop()
            const dir = `${__dirname}/../../Loggers/attachments/${guild.id}/${name}`

            // check if dir exists and create if not
            if (!existsSync(dirname(dir))) mkdirSync(dirname(dir), { recursive: true })

            const res = await fetch(url)
            const fileStream = createWriteStream(dir)

            await new Promise((resolve, reject) => {
              res.body.pipe(fileStream)
              res.body.on('error', (err) => reject(err))
              fileStream.on('finish', () => resolve())
            })
          } catch (error) {
            Logger.warn('Attachment Handler', `Failed to handle attachment`, error)
          }
        })
      }
    }

    // forward all messages to our attachment parser
    await attachmentHandler()

    // Logger every msg inside of guilds
    if (channel.type === 'text') {
      const db = await serverConfig.findOne({ where: { id: guild.id } })
      const messages = JSON.parse(db.dataValues.messages)

      if (!messages.channels[channel.id]) messages.channels[channel.id] = []

      messages.channels[channel.id].push({ username: tag, id, createdAt, content })
      await db.update({ messages: JSON.stringify(messages) })
    }

    // Logger every msg inside of DM's
    if (msg.channel.type === 'dm') {
      if (id === ownerID) return

      const db = await serverConfig.findOne({ where: { ownerID } })
      const messages = JSON.parse(db.dataValues.messages)

      if (!messages.dm[id]) messages.dm[id] = []

      messages.dm[id].push({ username, id, createdAt, content })
      await db.update({ messages: JSON.stringify(messages) })
    }
  }
}
