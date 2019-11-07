const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const attachmentHandler = require('./attachmentHandler')

module.exports = async (client, msg) => {
  const content = msg.content
  const guild = msg.guild

  //* forward all messages to our attachment parser
  await attachmentHandler(client, msg)

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
