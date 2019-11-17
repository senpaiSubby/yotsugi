const torrent2magnet = require('torrent2magnet')
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
/**
 * Handles filtering attachments and sending them where specified
 * to be further handled. EX: adding a torrent to transmission.
 * @param {*} client discord.js client
 * @param {*} url file url to be parsed
 */
const attachmentParser = async (client, url) => {
  const { logger } = client
  const { runCommand } = client.utils

  const name = url.split('/').pop()

  // if file is torrent then add to Transmission
  if (name.endsWith('.torrent')) {
    try {
      const torrent = await torrent2magnet(url)
      runCommand(client, `tor add ${torrent}`)
    } catch (error) {
      logger.warn(error)
    }
  }
}

/**
 * Handles messages containing attachments. Will save attachments
 * and forward urls to attachmentParser to be further handled.
 * @param {*} client discord.js client object
 * @param {*} msg discord.js message object
 */
const attachmentHandler = async (client, msg) => {
  const { logger } = client

  // check if msg contains attachments
  if (msg.attachments.size) {
    // save all attachements sent on server
    msg.attachments.forEach(async (a) => {
      try {
        // send urls to be further parsed
        await attachmentParser(client, a.url)
        const name = a.url.split('/').pop()
        const dir = `./data/logs/attachments/${name}`
        // check if dir exists and create if not
        if (!fs.existsSync(path.dirname(dir))) {
          fs.mkdirSync(path.dirname(dir), { recursive: true })
        }
        const res = await fetch(a.url)
        const fileStream = fs.createWriteStream(dir)

        await new Promise((resolve, reject) => {
          res.body.pipe(fileStream)
          res.body.on('error', (err) => {
            reject(err)
          })
          fileStream.on('finish', () => {
            resolve()
          })
        })
      } catch (error) {
        logger.warn(error)
      }
    })
  }
}

module.exports = attachmentHandler
