const express = require('express')
const device = require('express-device')
const serveIndex = require('serve-index')
const cors = require('cors')
const shortid = require('shortid')
const { duration } = require('moment')
const Subprocess = require('../../core/Subprocess')
const { Manager } = require('../../events/message')
require('moment-duration-format')

class WebServer extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'Web Server',
      description: 'Web Server',
      disabled: false
    })
  }

  async run() {
    shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-@')
    /**
     * example API usage
     *  {
     *      "command": "<command> <params>"
     *  }
     */
    const { client } = this
    const { webServerPort, ownerID } = client.config
    const { Logger, generalConfig } = client

    const checkApiKey = async (req, res) => {
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      const config = JSON.parse(db.dataValues.config)
      const { apiKey } = config.webUI

      if (!req.body.apiKey) {
        Logger.info(
          'Web Server',
          `[ ${req.device.type} ] [ ${req.device.parser.useragent.family} ] [ ${req.ip} ]sent command [ ${req.body.command} ] without APIKEY`
        )
        return res.status(401).json({ response: "Missing params 'apiKey'" })
      }
      if (req.body.apiKey !== apiKey) {
        Logger.info(
          'Web Server',
          `[ ${req.device.type} ] [ ${req.device.parser.useragent.family} ] [ ${req.ip} ] sent BAD APIKEY for command [ ${req.body.command} ]`
        )
        return res.status(401).json({ response: 'API key is incorrect' })
      }

      return true
    }

    const app = express()

    app.use(express.json())
    app.use(cors({ credentials: true, origin: ['http://127.0.0.1:3000'] }))
    app.use(express.static(`${__dirname}/app/build`))

    app.use(device.capture({ parseUserAgent: true }))

    // serve out icons folder
    app.use('/icons', express.static(`${__dirname}/../../data/images/icons`))
    app.use('/icons', serveIndex(`${__dirname}/../../data/images/icons`))

    // home page
    app.get('/', (req, res) => res.sendFile('/index.html'))

    // get DB info
    app.get('/api/db/app', async (req, res) => {
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      return res.status(200).json(JSON.parse(db.dataValues.config))
    })

    // set DB info
    app.post('/api/db/app', async (req, res) => {
      Logger.info(
        'Web Server',
        `DB update from [ ${req.device.type} ] [ ${req.device.parser.useragent.family} ] [ ${req.ip} ]`
      )
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      if (req.body.config) {
        await db.update({ config: JSON.stringify(req.body.config) })
        return res.sendStatus(200)
      }
    })

    // get DB info
    app.get('/api/db/ui', async (req, res) => {
      Logger.info(
        'Web Server',
        `New connection from [ ${req.device.type} ] [ ${req.device.parser.useragent.family} ] [ ${req.ip} ]`
      )

      const db = await generalConfig.findOne({ where: { id: ownerID } })
      const { webUI } = JSON.parse(db.dataValues.config)
      return res.status(200).json(webUI.commands)
    })

    // set DB info
    app.post('/api/db/ui', async (req, res) => {
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      const config = JSON.parse(db.dataValues.config)
      const { commands } = config.webUI

      if (req.body[0] && req.body[1]) {
        commands.push({ id: shortid.generate(), name: req.body[0], command: req.body[1] })
        await db.update({ config: JSON.stringify(config) })
        return res.status(200)
      }
    })

    // remove Button
    app.post('/api/db/ui/rm/:id', async (req, res) => {
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      const config = JSON.parse(db.dataValues.config)
      const { commands } = config.webUI

      const index = commands.findIndex((x) => x.id === req.params.id)
      commands.splice(index, 1)

      await db.update({ config: JSON.stringify(config) })
      return res.status(200)
    })

    // general bot info
    app.get('/api/info', async (req, res) => {
      const { uptime, user, status } = client
      const { username, id, avatar, localPresence } = user

      return res.status(200).json({
        username,
        id,
        avatar: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
        status,
        upTime: duration(uptime).format('d[d] h[h] m[m] s[s]'),
        presence: localPresence.game
      })
    })

    // endpoint for running commands
    app.post('/api/commands', async (req, res) => {
      const verified = await checkApiKey(req, res)

      if (typeof verified === 'boolean') {
        Logger.info(
          'Web Server',
          `Running command [ ${req.body.command} ] from [ ${req.device.type} ] [ ${req.device.parser.useragent.family} ] [ ${req.ip} ]`
        )

        const generalDB = await client.generalConfig.findOne({ where: { id: ownerID } })
        client.db.config = JSON.parse(generalDB.dataValues.config)

        // check if all required params are met
        if (!req.body.command) res.status(406).json({ response: "Missing params 'command'" })

        const args = req.body.command.split(' ')
        const cmdName = args.shift().toLowerCase()
        const cmd = Manager.findCommand(cmdName)

        if (cmd) {
          if (cmd.disabled) {
            return res.status(403).json({ response: 'Command is disabled bot wide.' })
          }

          if (!cmd.webUI) {
            return res.status(403).json({ response: 'Command is disabled for use in the API.' })
          }

          const response = await Manager.runCommand(client, cmd, null, args, true)
          return res.status(200).json({ response })
        }
        return res.status(406).json({ response: `Command [ ${req.body.command} ] not found.` })
      }
    })

    // Start server
    app.listen(webServerPort, '0.0.0.0', () => {
      Logger.ok(`Web Server`, `Active on port [ ${webServerPort} ]`)
    })
  }
}
module.exports = WebServer
