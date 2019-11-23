const express = require('express')
const shell = require('shelljs')

const app = express()
app.use(express.json())
const port = 5709

// your-username ALL=NOPASSWD: /sbin/shutdown

app.post('/', (req, res) => {
  // check if all required params are met
  if (!req.body.command) {
    return res.status(406).json({ response: "Missing params 'command'" })
  }

  // check if params are correct
  if (req.body.command !== 'off' && req.body.command === 'reboot') {
    return res.status(406).json({ response: "Valid commands are 'off' or 'reboot'" })
  }

  if (req.body.command === 'off') {
    // shutdown system
    if (shell.exec('sudo shutdown -h +1 "Shutting down in 1 minute."').code !== 0) {
      return res.status(500).json({ response: "Can't run shutdown" })
    }
    return res.status(200).json({ response: 'Success' })
  }
  if (req.body.command === 'reboot') {
    if (shell.exec('sudo shutdown -r +1 "Rebooting in 1 minute."').code !== 0) {
      return res.status(500).json({ response: "Can't run reboot" })
    }
    return res.status(200).json({ response: 'Success' })
  }
})

app.listen(port, () => {
  console.log('stop-server listening on port ' + port)
})
