/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Guild } from 'discord.js'
import { NezukoMessage } from 'typings'

import { createGunzip } from 'zlib'
import * as config from '../../config/config.json'
import { database } from '../database/database'
import { Log } from '../Logger'

/**
 * Handles setting up User, General and Server config for Nezuko
 */
export class ConfigManager {
  /**
   * Handles general config. Creating it if it doesn't exist
   */
  public static async handleGeneralConfig() {
    // Sync database so it is created if doesnt exist on disk
    await database.sync()

    // Fetch owner ID from config
    const { ownerID } = config

    // Load database
    const db = await database.models.Configs.findOne({ where: { id: ownerID } })

    // If database exists
    if (db) {
      // Handle DB changes for existing databases
      const cfg = JSON.parse(db.get('config') as string)
      // Await db.update({ config: JSON.stringify(cfg) })
    }
    // If database doesn\'t exist then create it with the following defaults
    else {
      // Log that new table is created
      Log.info('Config Manager', `Created new general config for [ ${ownerID} ]`)

      // Create new table for configs
      await database.models.Configs.create({
        id: ownerID,
        config: JSON.stringify({
          archivebox: { path: null },
          autorun: { channelID: null, tasks: [] },
          disabledCommands: [],
          docker: { host: null },
          emby: { apiKey: null, host: null, userID: null },
          google: { apiKey: null },
          googleHome: { ip: null, language: null, name: null },
          jackett: { apiKey: null, host: null },
          jellyfin: { apiKey: null, host: null, userID: null },
          lockedCommands: [],
          meraki: { apiKey: null, serialNum: null },
          ombi: { apiKey: null, host: null, username: null },
          pihole: { apiKey: null, host: null },
          aria2: { host: null, port: null, secure: false, secret: null, saveDir: null },
          pioneerAVR: { host: null },
          routines: [],
          sabnzbd: { apiKey: null, host: null },
          sengled: { jsessionid: null, password: null, username: null },
          shortcuts: [],
          systemPowerControl: [{ host: 'xxx', mac: 'xxx', name: 'xxx' }],
          transmission: {
            host: null,
            port: '9091',
            ssl: false,
            username: null,
            password: null
          },
          tuyaDevices: [{ id: 'xxxxxxx', key: 'xxx', name: 'xxx' }]
        })
      })
    }
  }

  /**
   * Handles server config
   * @param guild Guild that the message from sent from
   */
  public static async handleServerConfig(guild: Guild) {
    const { id, ownerID, name } = guild

    // If not ran from guild return default prefix from config
    if (!guild) return config.prefix

    // Laod server config database
    const db = await database.models.Servers.findOne({
      where: { id }
    })

    // If database table exists for guild
    if (db) {
      // Load server config
      const conf = JSON.parse(db.get('config') as string)

      // Return server prefix
      return conf.prefix || config.prefix
    }

    // If database table doesn't exist for guild
    // Log that a new table is being created
    Log.info('Config Manager', `Creating new server config for guild ID [ ${guild.id} ] [ ${guild.name} ]`)

    // Create new database with following defaults
    return database.models.Servers.create({
      id,
      ownerID,
      config: JSON.stringify({
        prefix: config.prefix,
        lockedCommands: [],
        disabledCommands: []
      }),
      statChannels: JSON.stringify({
        bots: { enabled: false, channelID: null },
        categoryID: null,
        enabled: false,
        members: { enabled: false, channelID: null },
        total: { enabled: false, channelID: null }
      }),
      serverName: name
    })
  }

  /**
   * Handles member config
   * @param msg Original message
   */
  public static async handleMemberConfig(msg: NezukoMessage) {
    const { author } = msg
    const { id, tag: username } = author

    // Fetch and load member database
    const db = await database.models.Members.findOne({ where: { id } })

    // If database table for memeber doesn't exist
    if (!db) {
      // Log that a new table will be created
      Log.info('Config Manager', `Created new member config for user [ ${id} ] [ ${username} ]`)

      // Create new member table with following defaults
      return database.models.Members.create({
        username,
        id,
        config: JSON.stringify({ todos: [] })
      })
    }
  }
}
