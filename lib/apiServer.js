const express = require('express')
const chalk = require('chalk')

module.exports = async (client) => {
  const { apiPort, apiKey } = client.config.general
  const { logger } = client

  /* USAGE
   *  {   "apiKey": "KEY FROM CONFIG",
   *      "command": "<command> <params>"
   *  }
   */
  const app = express()
  app.use(express.json())
  app.post('/', async (req, res) => {
    logger.info(
      chalk.green(`${chalk.yellow(req.ip)} sent command ${chalk.yellow(req.body.command)}`)
    )

    //* check if all required params are met
    if (!req.body.apiKey && !req.body.command) {
      res.status(406).json({ response: "Missing params 'apiKey' and 'command'" })
    }

    //* check if apikey match config
    if (req.body.apiKey !== apiKey) {
      res.status(401).json({ response: 'Bad API key.' })
    } else {
      //* anything after command becomes a list of args
      const args = req.body.command.split(/ +/)
      //* command name without prefix
      const command = args.shift().toLowerCase()
      const cmd =
        client.commands.get(command) ||
        client.commands.find((cmd) => cmd.help.aliases && cmd.help.aliases.includes(command))

      //* if command exists
      if (cmd) {
        //* Check if command is enabled
        if (!cmd.options.enabled) {
          res.status(403).json({ response: 'Command is disabled bot wide.' })
        } else if (!cmd.options.apiEnabled) {
          //* check if command is enabled in API
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
    app.listen(apiPort, '0.0.0.0', () => {
      logger.info(chalk.green(`API server listening on port ${chalk.yellow(apiPort)}`))
    })
  } catch (e) {
    logger.warn(e)
  }
}
