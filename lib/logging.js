const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const attachmentParser = require('./attachmentParser')

module.exports = async (client, msg) => {
  const content = msg.content
  const guild = msg.guild

  //* save all attachements sent on server
  msg.attachments.forEach(async (a) => {
    const name = a.url.split('/').pop()
    //* send attachment urls to our attachmentParser
    await attachmentParser(client, msg, a.url)

    const dir = `./data/logs/attachments/${name}`
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
  })

  //* log every msg inside of guilds
  if (msg.channel.type === 'text') {
    const dir = `./data/logs/guilds/${guild.id} - ${guild.name}/${msg.channel.id} - ${msg.channel.name}.txt`
    const text = `${Date.now()} | ${msg.author.id} - ${msg.author.tag} => ${content}\n`
    //* check if folders exist and create if they dont
    if (!fs.existsSync(path.dirname(dir))) {
      fs.mkdirSync(path.dirname(dir), { recursive: true })
    }
    //* append chat to log file
    fs.appendFile(dir, text, (err) => {
      if (err) throw err
    })
  }

  //* log every msg inside of DM's
  if (msg.channel.type === 'dm') {
    const dir = `./data/logs/dm/${msg.author.id}/${msg.author.tag}.txt`
    const text = `${Date.now()} | ${msg.author.tag} => ${content}\n`
    //* check if folders exist and create if they dont
    if (!fs.existsSync(path.dirname(dir))) {
      fs.mkdirSync(path.dirname(dir), { recursive: true })
    }
    //* append chat to log file
    fs.appendFile(dir, text, (err) => {
      if (err) throw err
    })
  }
}
