const { Client } = require('discord.js')
const { exec } = require('shelljs')
const Database = require('./nezuko/core/Database/Database')

// clear terminal
exec('clear')

// Initialise
const client = new Client()

client.config = require('./config/config')
client.Logger = require('./nezuko/core/Logger')
client.Utils = require('./nezuko/core/Utils')

client.db = []
client.generalConfig = Database.Models.generalConfig
client.serverConfig = Database.Models.serverConfig
client.memberConfig = Database.Models.memberConfig

module.exports = { client }

// handle DB config
const handleConfig = async () => {
  const { ownerID } = client.config
  const db = await client.generalConfig.findOne({ where: { id: ownerID } })

  if (db && db.config) {
    const config = JSON.parse(db.config)

    if (config) {
      if (!config.lockedCommands) {
        config.lockedCommands = []
        await db.update({ config: JSON.stringify(config) })
      }
      if (!config.autorun) {
        config.autorun = []
        await db.update({ config: JSON.stringify(config) })
      }
    }
  }

  if (!db) {
    client.Logger.info('Handle Config', `Created new general config for [ ${ownerID} ]`)
    await client.generalConfig.create({
      username: 'Nezuko',
      id: ownerID,
      config: JSON.stringify({
        archivebox: { path: null },
        autorun: [],
        disabledCommands: [],
        docker: { host: null },
        emby: { apiKey: null, host: null, userID: null },
        googleHome: { ip: null, language: null, name: null },
        google: { apiKey: null },
        jackett: { apiKey: null, host: null },
        lockedCommands: [],
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
const eventFiles = client.Utils.findNested(`${__dirname}/nezuko/events`, '.js')
eventFiles.forEach((file) => require(file))

// Logger discord warnings
client.on('warn', (info) => console.log(`warn: ${info}`))
client.on('reconnecting', () => console.log(`client tries to reconnect to the WebSocket`))
client.on('resume', (replayed) => console.log(`whenever a WebSocket resumes, ${replayed} replays`))

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason) =>
  client.Logger.error('Unhandled Rejection', reason, true)
)
// Unhandled Errors
process.on('uncaughtException', (error) => client.Logger.error('Uncaught Exception', error, true))

// Login
client.login(client.config.token)
