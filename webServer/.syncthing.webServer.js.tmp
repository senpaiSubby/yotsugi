const express = require('express')
const chalk = require('chalk')
const cors = require('cors')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const shortid = require('shortid')

/**
 * A simple API server for remotely running the discord.js commands of this project
 *
 * @param {*} client discord.js client object
 */
const webServer = async (client) => {
  shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-@')
  /**
   * example API usage
   *  {   "apiKey": "KEY FROM CONFIG",
   *      "command": "<command> <params>"
   *  }
   */

  const { apiPort, apiKey } = client.config.general
  const { logger } = client

  const app = express()
  app.use(express.json())
  app.use(
    cors({
      credentials: true,
      origin: ['http://127.0.0.1:3000']
    })
  )
  app.use(express.static(__dirname + '/app/build'))

  app.get('/ui/db', (req, res) => {
    const adapter = new FileSync('./data/db.json')
    const db = low(adapter)
    const data = {
      uiButtons: db.get('uiButtons')
    }
    res.status(200).json(data)
  })
  app.post('/ui/db', (req, res) => {
    const adapter = new FileSync('./data/db.json')
    const db = low(adapter)

    if (req.body[0] && req.body[1]) {
      db.get('uiButtons')
        .push({ id: shortid.generate(), name: req.body[0], command: req.body[1] })
        .write()
    }
  })

  app.post('/ui/db/rm/:id', (req, res) => {
    const adapter = new FileSync('./data/db.json')
    const db = low(adapter)
    db.get(`uiButtons`)
      .remove({ id: req.params.id })
      .write()
    res.status(200)
  })

  app.get('/api/info', (req, res) => {
    const upTime = client.utils.millisecondsToTime(client.uptime)
    const data = {
      username: client.user.username,
      id: client.user.id,
      avatarId: client.user.avatar,
      status: client.status,
      upTime: upTime,
      presence: client.user.localPresence.game,
      avatar: client.user.avatarURL
    }
    res.status(200).json(data)
  })

  app.get('/', (req, res) => {
    console.log('hit')
    res.sendFile('/index.html')
  })

  app.post('/api/commands', async (req, res) => {
    logger.info(
      chalk.green(`${chalk.yellow(req.ip)} sent command ${chalk.yellow(req.body.command)}`)
    )

    // check if all required params are met
    if (!req.body.apiKey && !req.body.command) {
      res.status(406).json({ response: "Missing params 'apiKey' and 'command'" })
    }

    // check if apikey match config
    if (req.body.apiKey !== apiKey) {
      res.status(401).json({ response: 'Bad API key.' })
    } else {
      // anything after command becomes a list of args
      const args = req.body.command.split(/ +/)
      // command name without prefix
      const command = args.shift().toLowerCase()
      const cmd =
        client.commands.get(command) ||
        client.commands.find((cmd) => cmd.help.aliases && cmd.help.aliases.includes(command))

      // if command exists
      if (cmd) {
        // Check if command is enabled
        if (!cmd.options.enabled) {
          res.status(403).json({ response: 'Command is disabled bot wide.' })
        } else if (!cmd.options.apiEnabled) {
          // check if command is enabled in API
          res.status(403).json({ response: 'Command is disabled for use in the API.' })
        }
        const response = await cmd.execute(client, null, args, 'api')
        res.status(200).json({ response: response })
      } else {
        res.status(406).json({ response: `Command '${req.body.command}' not found.` })
      }
    }
  })
  try {
    app.listen(apiPort, () => {
      logger.info(chalk.green(`API server listening on port ${chalk.yellow(apiPort)}`))
    })
  } catch (e) {
    logger.warn(e)
  }
}

module.exports = webServer
