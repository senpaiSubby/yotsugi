const express = require('express')
const chalk = require('chalk')
const cors = require('cors')
const shortid = require('shortid')
const Subprocess = require('../../Subprocess')
const { client } = require('../../../index')
const { Manager } = require('../../../events/message')
const Database = require('../../../core/Database')

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

    const { webServerPort } = client.config
    const { Log } = client

    const app = express()
    app.use(express.json())
    app.use(
      cors({
        credentials: true,
        origin: ['http://127.0.0.1:3000']
      })
    )
    app.use(express.static(`${__dirname}/app/build`))

    app.get('/ui/db', async (req, res) => {
      const generalConfig = await Database.Models.generalConfig.findOne({
        where: { id: client.config.ownerID }
      })
      const data = {
        uiButtons: JSON.parse(generalConfig.dataValues.webUI)
      }
      return res.status(200).json(data)
    })

    app.post('/ui/db', async (req, res) => {
      const generalConfig = await Database.Models.generalConfig.findOne({
        where: { id: client.config.ownerID }
      })
      const values = JSON.parse(generalConfig.dataValues.webUI)

      if (req.body[0] && req.body[1]) {
        values.push({ id: shortid.generate(), name: req.body[0], command: req.body[1] })
        await generalConfig.update({ webUI: JSON.stringify(values) })
        return res.status(200)
      }
    })

    app.post('/ui/db/rm/:id', async (req, res) => {
      const generalConfig = await Database.Models.generalConfig.findOne({
        where: { id: client.config.ownerID }
      })
      const values = JSON.parse(generalConfig.dataValues.webUI)
      const index = values.findIndex((x) => x.id === req.params.id)
      values.splice(index, 1)
      await generalConfig.update({ webUI: JSON.stringify(values) })

      return res.status(200)
    })

    app.get('/api/info', (req, res) => {
      const upTime = client.Utils.millisecondsToTime(client.uptime)
      const data = {
        username: client.user.username,
        id: client.user.id,
        avatarId: client.user.avatar,
        status: client.status,
        upTime,
        presence: client.user.localPresence.game,
        avatar: client.user.avatarURL
      }
      return res.status(200).json(data)
    })

    app.get('/', (req, res) => {
      res.sendFile('/index.html')
    })

    app.post('/api/commands', async (req, res) => {
      Log.info(
        chalk.green(`${chalk.yellow(req.ip)} sent command ${chalk.yellow(req.body.command)}`)
      )

      // check if all required params are met
      if (!req.body.command) res.status(406).json({ response: "Missing params 'command'" })

      // set db configs
      const generalConfig = await Database.Models.generalConfig.findOne({
        where: { id: client.config.ownerID }
      })

      client.db.general = generalConfig.dataValues

      // anything after command becomes a list of args
      const args = req.body.command.split(/ +/)
      // command name without prefix
      const cmdName = args.shift().toLowerCase()
      const cmd = Manager.findCommand(cmdName)
      // if command exists
      if (cmd) {
        // Check if command is enabled
        if (cmd.disabled) return res.status(403).json({ response: 'Command is disabled bot wide.' })

        if (!cmd.webUI)
          return res.status(403).json({ response: 'Command is disabled for use in the API.' })

        const response = await Manager.runCommand(client, cmd, null, args, true)
        return res.status(200).json({ response })
      }
      return res.status(406).json({ response: `Command '${req.body.command}' not found.` })
    })

    app.listen(webServerPort, () => {
      Log.info(`Web Server Up`, `Listening on port ${webServerPort}`)
    })
  }
}
module.exports = WebServer
