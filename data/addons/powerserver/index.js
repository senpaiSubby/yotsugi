const express = require('express')
const shell = require('shelljs')

const app = express()
app.use(express.json())
const port = 5709
const apiKey = 284695

// your-username ALL=NOPASSWD: /sbin/shutdown

app.post('/', (req, res) => {
  console.log(req.body)
  //* check if all required params are met
  if (!req.body.apiKey && !req.body.command) {
    res.status(406).json({ response: "Missing params 'apiKey' and 'command'" })
  }

  //* check if params are correct
  if (req.body.command !== 'off' && req.body.command === 'reboot') {
    res.status(406).json({ response: "Valid commands are 'off' or 'reboot'" })
  }

  //* check if apikey match config
  if (req.body.apiKey !== apiKey) {
    res.sendStatus(401)
  }

  if (req.body.command === 'off') {
    //* shutdown system
    if (shell.exec('sudo shutdown -h +1 "Shutting down in 1 minute."').code !== 0) {
      res.status(500).json({ response: "Can't run shutdown" })
    } else {
      res.status(200).json({ response: 'Success' })
    }
  } else if (req.body.command === 'reboot') {
    //* reboot system
    if (shell.exec('sudo shutdown -r +1 "Rebooting in 1 minute."').code !== 0) {
      res.status(500).json({ response: "Can't run reboot" })
    } else {
      res.status(200).json({ response: 'Success' })
    }
  }
})

app.listen(port, () => {
  console.log('stop-server listening on port ' + port)
})
