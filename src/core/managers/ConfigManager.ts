/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Guild } from 'discord.js'
import { NezukoMessage } from 'typings'

import * as config from '../../config/config.json'
import { database, generalConfig } from '../database/database'
import { Log } from '../Logger'

/**
 * Handles setting up User, General and Server config for Nezuko
 */
export class ConfigManager {
  /**
   * Handles general config
   */
  public static async handleGeneralConfig() {
    await database.sync()
    const { ownerID } = config
    const db = await generalConfig(ownerID)

    if (!db) {
      Log.info('Config Manager', `Created new general config for [ ${ownerID} ]`)
      await database.models.Configs.create({
        id: ownerID,
        config: JSON.stringify({
          archivebox: { path: null },
          autorun: [],
          disabledCommands: [],
          docker: { host: null },
          emby: { apiKey: null, host: null, userID: null },
          google: { apiKey: null },
          googleHome: { ip: null, language: null, name: null },
          jackett: { apiKey: null, host: null },
          jellyfin: { apiKey: null, host: null, userID: null },
          lockedCommands: [],
          meraki: { apiKey: null, serielNum: null },
          ombi: { apiKey: null, host: null, username: null },
          pihole: { apiKey: null, host: null },
          aria2: { host: null, port: null, secure: false, secret: null, saveDir: null },
          pioneerAVR: { host: null },
          routines: [],
          rssFeeds: [],
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
          tuyaDevices: [{ id: 'xxxxxxx', key: 'xxx', name: 'xxx' }],
          webUI: { apiKey: '111', commands: [] }
        })
      })
    }

    // Handle DB changes for existing databases
    const cfg = JSON.parse(db.get('config') as string)

    if (!cfg.rssFeeds) {
      cfg.rssFeeds = []
      await db.update({ config: JSON.stringify(cfg) })
    }
    if (!cfg.transmission.username && !cfg.transmission.password) {
      cfg.transmission.username = null
      cfg.transmission.password = null
      await db.update({ config: JSON.stringify(cfg) })
    }
    if (!cfg.aria2) {
      cfg.aria2 = { host: null, port: null, secure: false, secret: null, saveDir: null }
      await db.update({ config: JSON.stringify(cfg) })
    }
  }

  /**
   * Handles server config
   * @param guild Guild that the message from sent from
   */
  public static async handleServerConfig(guild: Guild) {
    // * -------------------- Setup --------------------
    const { id, ownerID, name } = guild

    // * -------------------- Handle Per Server Configs --------------------

    // Per server config
    if (!guild) return config.prefix

    let db = await database.models.Servers.findOne({
      where: { id }
    })

    if (!db) {
      Log.info('Config Manager', `Creating new server config for guild ID [ ${guild.id} ] [ ${guild.name} ]`)
      db = await database.models.Servers.create({
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

    // * just to handle db updates when adding commands
    const conf = JSON.parse(db.get('config') as string)

    return conf.prefix || config.prefix
  }

  /**
   * Handles member config
   * @param msg Original message
   */
  public static async handleMemberConfig(msg: NezukoMessage) {
    // * -------------------- Setup --------------------
    const { author } = msg
    const { id, tag: username } = author

    // * -------------------- Setup --------------------

    const db = await database.models.Members.findOne({ where: { id } })

    if (!db) {
      Log.info('Config Manager', `Created new member config for user [ ${id} ] [ ${username} ]`)
      await database.models.Members.create({
        username,
        id,
        config: JSON.stringify({ todos: [] })
      })
    }
  }
}
