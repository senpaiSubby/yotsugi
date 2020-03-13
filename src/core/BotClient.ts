/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Client, GuildMember, Message } from 'discord.js'
import { ClientDB, NezukoMessage } from 'typings'

import * as config from '../config/config.json'
import { guildMemberAdd } from '../events/guildMemberAdd'
import { guildMemberRemove } from '../events/guildMemberRemove'
import { onMessage } from '../events/message'
import { messageDelete } from '../events/messageDelete'
import { messageReactionAdd } from '../events/messageReactionAdd'
import { messageReactionRemove } from '../events/messageReactionRemove'
import { messageUpdate } from '../events/messageUpdate'
import { database } from './database/database'
import { Log } from './Logger'
import { CommandManager } from './managers/CommandManager'
import { ConfigManager } from './managers/ConfigManager'
import { StatsManager } from './managers/StatsManager'
import { SubprocessManager } from './managers/SubprocessManager'
import { Utils } from './Utils'

export class BotClient extends Client {
  public config: {
    ownerID: string
    prefix: string
    token: string
    apiPort: number
    exemptUsers: string[]
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
  public subprocessManager: SubprocessManager

  constructor() {
    super()

    this.config = config
    this.Log = Log
    this.Utils = Utils

    this.db = {}
    this.generalConfig = database.models.Configs
    this.serverConfig = database.models.Servers
    this.memberConfig = database.models.Members

    // Log discord warnings
    this.on('warn', (info) => console.log(`warn: ${info}`))
    this.on('reconnecting', () => this.Log.warn('Altair', 'Reconnecting to Discord'))
    this.on('resume', () => this.Log.warn('Altair', 'Reconnected to Discord'))

    // Unhandled Promise Rejections
    process.on('unhandledRejection', (reason: any) => this.Log.error('Unhandled Rejection', reason.stack))
    // Unhandled Errors
    process.on('uncaughtException', (error) => this.Log.error('Uncaught Exception', error))
  }

  /**
   * Starts Altair
   */
  public async start() {
    console.log('-'.repeat(60))

    console.log('Copyright callmekory 2020 - https://github.com/callmekory\n')

    // Login
    await this.login(this.config.token)
    Log.ok('Altiar Ready', `Username is [ ${this.user.tag} ]`)
    await this.user.setActivity(`${config.prefix}`, { type: 'LISTENING' })

    Log.info('Bot Invite Link', `${await this.generateInvite()}\n`)

    console.log('-'.repeat(60))

    // Handle general config

    await ConfigManager.handleGeneralConfig()

    const guilds = this.guilds.map((guild) => guild.id)

    for (const guildID of guilds) {
      const guild = this.guilds.get(guildID)

      // Handle server configs
      await ConfigManager.handleServerConfig(guild)

      // Update server sidebar stats
      await StatsManager.updateStats(guild)
    }

    // * ---------- start subprocess and command managers ----------

    this.commandManager = new CommandManager(this)
    this.subprocessManager = new SubprocessManager(this)

    // * ---------- Events ----------

    this.on('message', async (message: NezukoMessage) => await onMessage(message, this))
    this.on('messageUpdate', async (old: Message, _new: NezukoMessage) => await messageUpdate(old, _new, this))
    this.on('guildMemberAdd', async (member: GuildMember) => await guildMemberAdd(member))
    this.on('guildMemberRemove', async (member: GuildMember) => await guildMemberRemove(member))
    this.on('messageReactionAdd', async (reaction, user) => await messageReactionAdd(reaction, user))
    this.on('messageReactionRemove', async (reaction) => await messageReactionRemove(reaction))
    this.on('messageDelete', async (message: Message) => await messageDelete(message, this))
  }
}
