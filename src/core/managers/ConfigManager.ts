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
          priceTracking: [],
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
          pioneerAVR: { host: null },
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
          announcementChannel: null,
          logChannel: null,
          prefix: config.prefix,
          rules: [],
          modMailChannel: null,
          leveling: false,
          levelMultiplier: 2,
          starboardChannel: null,
          welcomeChannel: null,
          verifyUsers: false,
          verifyChannel: null,
          verifiedRole: null
        }),
        levelMultiplier: '2',
        memberLevels: JSON.stringify({
          levelRoles: [],
          levels: {}
        }),
        messages: JSON.stringify({
          channels: {},
          dm: {}
        }),
        statChannels: JSON.stringify({
          enabled: false,
          categoryID: null,
          total: { enabled: true, channelID: null },
          bots: { enabled: true, channelID: null },
          members: { enabled: true, channelID: null }
        }),
        userActivity: JSON.stringify({}),
        serverName: name
      })
    }

    // * just to handle db updates when adding commands
    const conf = JSON.parse(db.get('config') as string)

    if (!conf.announcementChannel) {
      conf.announcementChannel = null
      await db.update({ config: JSON.stringify(conf) })
    }

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
