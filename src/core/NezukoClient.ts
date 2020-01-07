/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import * as config from '../config/config.json'

import { Client, GuildMember, Message } from 'discord.js'
import { ClientDB, NezukoMessage } from 'typings'
import { CommandManager } from './managers/CommandManager'
import { ConfigManager } from './managers/ConfigManager'
import { SubprocessManager } from './managers/SubprocessManager'
import { Log } from './utils/Logger'
import { Utils } from './utils/Utils'

import { guildMemberAdd } from '../events/guildMemberAdd'
import { guildMemberRemove } from '../events/guildMemberRemove'
import { messageReactionAdd } from '../events/messageReactionAdd'
import { database } from './database/database'

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
    process.on('unhandledRejection', (reason: any) => {
      this.Log.error('Unhandled Rejection', reason.stack)
    })
    // Unhandled Errors
    process.on('uncaughtException', (error) => {
      this.Log.error('Uncaught Exception', error)
    })
  }

  /**
   * Starts Nezuko
   */
  public async start() {
    // Once bot connects to discord
    this.once('ready', async () => {
      Log.ok('Client Ready', `Connected as [ ${this.user.username} ]`)

      // Handle general config
      ConfigManager.handleGeneralConfig()

      // * ---------- Events ----------

      // On message
      this.on(
        'message',
        async (message: NezukoMessage) =>
          await this.commandManager.handleMessage(message, this, true)
      )

      // On message edits
      this.on('messageUpdate', async (old: Message, _new: NezukoMessage) => {
        if (old.content !== _new.content) await this.commandManager.handleMessage(_new, this)
      })

      this.on('guildMemberAdd', async (member: GuildMember) => await guildMemberAdd(member))
      this.on('guildMemberRemove', async (member: GuildMember) => await guildMemberRemove(member))

      this.on(
        'messageReactionAdd',
        async (reaction, user) => await messageReactionAdd(reaction, user)
      )

      // * ---------- Load and start subprocessess ----------
      await new SubprocessManager(this).loadModules()
    })

    // Login
    await this.login(this.config.token)
  }
}
