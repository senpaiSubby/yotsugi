/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import * as config from './config/config.json'

import { Client, GuildMember, Message } from 'discord.js'
import { ClientDB, NezukoMessage } from 'typings'
import { CommandManager } from './core/managers/CommandManager'
import { ConfigManager } from './core/managers/ConfigManager'
import { SubprocessManager } from './core/managers/SubprocessManager'
import { Log } from './core/utils/Logger'
import { Utils } from './core/utils/Utils'

import { guildMemberAdd } from 'events/guildMemberAdd'
import { guildMemberRemove } from 'events/guildMemberRemove'
import { database } from './core/database/database'

export class NezukoClient extends Client {
  public config: {
    ownerID: string
    prefix: string
    token: string
    webServerPort: number
  }

  // tslint:disable-next-line:variable-name
  public Utils: typeof Utils
  // tslint:disable-next-line:variable-name
  public Log: typeof Log

  public p: string | undefined
  public db: ClientDB
  public generalConfig: any
  public serverConfig: any
  public memberConfig: any
  public commandManager: CommandManager
  public subprocessManager: SubprocessManager | undefined

  constructor() {
    super()

    this.config = config
    this.Log = Log
    this.Utils = Utils

    this.commandManager = new CommandManager(this)

    this.db = {}
    this.generalConfig = database.models.GeneralConfig
    this.serverConfig = database.models.ServerConfig
    this.memberConfig = database.models.MemberConfig

    // Log discord warnings
    this.on('warn', (info) => console.log(`warn: ${info}`))
    this.on('reconnecting', () => console.log(`client tries to reconnect to the WebSocket`))
    this.on('resume', (replayed) => {
      console.log(`whenever a WebSocket resumes, ${replayed} replays`)
    })

    // Unhandled Promise Rejections
    process.on('unhandledRejection', (reason) => {
      this.Log.error('Unhandled Rejection', reason)
    })
    // Unhandled Errors
    process.on('uncaughtException', (error) => {
      this.Log.error('Uncaught Exception', error)
    })
  }

  /**
   * Starts Nezuko
   */
  public start() {
    const { handleMessage } = this.commandManager
    // Login
    this.login(this.config.token)

    // Once bot connects to discord
    this.once('ready', async () => {
      Log.ok('Client Ready', `Connected as [ ${this.user.username} ]`)

      // Handle general config
      ConfigManager.handleGeneralConfig()

      // * ---------- Events ----------

      // On message
      this.on('message', async (message: NezukoMessage) => await handleMessage(message, this, true))

      // On message edits
      this.on('messageUpdate', async (old: Message, _new: NezukoMessage) => {
        if (old.content !== _new.content) await this.commandManager.handleMessage(_new, this)
      })

      this.on('guildMemberAdd', async (member: GuildMember) => await guildMemberAdd(member))
      this.on('guildMemberRemove', async (member: GuildMember) => await guildMemberRemove(member))

      // * ---------- Load and start subprocessess ----------
      await new SubprocessManager(this).loadModules()
    })
  }
}
