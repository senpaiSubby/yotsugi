const { Client } = require('discord.js')
const { exec } = require('shelljs')
const Database = require('./core/Database/Database')

// clear terminal
exec('clear')

// Initialise
const client = new Client()

client.config = require('./data/config')
client.Log = require('./core/Log')
client.Utils = require('./core/Utils')

client.db = []
client.generalConfig = Database.Models.generalConfig
client.serverConfig = Database.Models.serverConfig
client.memberConfig = Database.Models.memberConfig

module.exports = { client }

// handle DB config
const handleConfig = async () => {
  const config = await client.generalConfig.findOne({ where: { id: client.config.ownerID } })

  if (!config) {
    client.Log.info('Handle Config', `Created new general config for [ ${client.config.ownerID} ]`)
    await client.generalConfig.create({
      username: 'Nezuko',
      id: client.config.ownerID,
      config: JSON.stringify({
        archivebox: { path: null },
        autocmd: [],
        disabledCommands: [],
        docker: { host: null },
        emby: { apiKey: null, host: null, userID: null },
        googleHome: { ip: null, language: null, name: null },
        google: { apiKey: null },
        jackett: { apiKey: null, host: null },
        meraki: { apiKey: null, serielNum: null },
        ombi: { apiKey: null, host: null, username: null },
        pihole: { apiKey: null, host: null },
        pioneerAVR: { host: null },
        rclone: { remote: null },
        routines: [],
        sabnzbd: { apiKey: null, host: null },
        sengled: { jsessionid: null, password: null, username: null },
        shortcuts: [],
        systemPowerControl: [{ host: 'xxx', mac: 'xxx', name: 'xxx' }],
        transmission: { host: null, port: '9091', ssl: false },
        tuyaDevices: [{ id: 'xxxxxxx', key: 'xxx', name: 'xxx' }],
        webUI: { apiKey: '111', commands: [] }
      })
    })
  }
}
handleConfig()

// Load event handlers
const eventFiles = client.Utils.findNested('./events', '.js')
eventFiles.forEach((file) => require(file))

client.on('warn', (info) => {
  console.log(`warn: ${info}`)
})
client.on('reconnecting', () => {
  console.log(`client tries to reconnect to the WebSocket`)
})
client.on('resume', (replayed) => {
  console.log(`whenever a WebSocket resumes, ${replayed} replays`)
})

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason) => client.Log.error('Unhandled Rejection', reason, true))

// Unhandled Errors
process.on('uncaughtException', (error) => client.Log.error('Uncaught Exception', error, true))

// login
client.login(client.config.token)
