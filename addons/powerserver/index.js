const express = require('express')
const shell = require('shelljs')

const app = express()
app.use(express.json())
const port = 5709

// your-username ALL=NOPASSWD: /sbin/shutdown

app.post('/', (req, res) => {
  if (!req.body.command) return res.status(406).json({ response: "Missing params 'command'" })

  switch (req.body.command) {
    case 'off': {
      if (shell.exec('sudo shutdown -h +1 "Shutting down in 1 minute."').code !== 0) {
        return res.status(500).json({ response: "Can't run shutdown" })
      }
      return res.status(200).json({ response: 'Success' })
    }
    case 'reboot': {
      if (shell.exec('sudo shutdown -r +1 "Rebooting in 1 minute."').code !== 0) {
        return res.status(500).json({ response: "Can't run reboot" })
      }
      return res.status(200).json({ response: 'Success' })
    }
    default: {
      return res.status(406).json({ response: "Valid commands are 'off' or 'reboot'" })
    }
  }
})

app.listen(port, () => console.log(`powerserver listening on port  ${port}`))
