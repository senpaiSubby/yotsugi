const express = require('express')
const cors = require('cors')
const shortid = require('shortid')
const Subprocess = require('../../core/Subprocess')
const { Manager } = require('../../events/message')

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
    const { Log, generalConfig } = client

    const app = express()

    app.use(express.json())
    app.use(cors({ credentials: true, origin: ['http://127.0.0.1:3000'] }))
    app.use(express.static(`${__dirname}/app/build`))

    // home page
    app.get('/', (req, res) => res.sendFile('/index.html'))

    // get DB info
    app.get('/ui/db', async (req, res) => {
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      const { webUI } = JSON.parse(db.dataValues.config)
      return res.status(200).json({ uiButtons: webUI.commands })
    })

    // set DB info
    app.post('/ui/db', async (req, res) => {
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      const config = JSON.parse(db.dataValues.config)
      const { webUI } = config

      if (req.body[0] && req.body[1]) {
        webUI.commands.push({ id: shortid.generate(), name: req.body[0], command: req.body[1] })
        await db.update({ config: JSON.stringify(config) })
        return res.status(200)
      }
    })

    // remove Button
    app.post('/ui/db/rm/:id', async (req, res) => {
      const db = await generalConfig.findOne({ where: { id: ownerID } })
      const config = JSON.parse(db.dataValues.config)
      const { webUI } = config

      const index = webUI.commands.findIndex((x) => x.id === req.params.id)
      webUI.commands.splice(index, 1)

      await config.update({ config: JSON.stringify(config) })
      return res.status(200)
    })

    // general bot info
    app.get('/api/info', (req, res) => {
      const { Utils, uptime, user, status } = client
      const { username, id, avatar, localPresence } = user
      const { millisecondsToTime } = Utils

      return res.status(200).json({
        username,
        id,
        avatarId: avatar,
        status,
        upTime: millisecondsToTime(uptime),
        presence: localPresence.game
      })
    })

    // endpoint for running commands
    app.post('/api/commands', async (req, res) => {
      Log.info('Web Server', `${req.ip} sent command ${req.body.command}`)

      const generalDB = await client.generalConfig.findOne({ where: { id: ownerID } })
      client.db.config = JSON.parse(generalDB.dataValues.config)

      // check if all required params are met
      if (!req.body.command) res.status(406).json({ response: "Missing params 'command'" })

      const args = req.body.command.split(' ')
      const cmdName = args.shift().toLowerCase()
      const cmd = Manager.findCommand(cmdName)

      if (cmd) {
        if (cmd.disabled) return res.status(403).json({ response: 'Command is disabled bot wide.' })

        if (!cmd.webUI) {
          return res.status(403).json({ response: 'Command is disabled for use in the API.' })
        }

        const response = await Manager.runCommand(client, cmd, null, args, true)
        return res.status(200).json({ response })
      }
      return res.status(406).json({ response: `Command '${req.body.command}' not found.` })
    })

    // Start server
    app.listen(webServerPort, '0.0.0.0', () => {
      Log.info(`Web Server`, `Listening on port ${webServerPort}`)
    })
  }
}
module.exports = WebServer
