/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Client, GuildMember, Message } from 'discord.js'
import { NezukoMessage } from 'typings'
import * as config from '../config/config.json'
import { guildMemberAdd } from '../events/guildMemberAdd'
import { guildMemberRemove } from '../events/guildMemberRemove'
import { onMessage } from '../events/message'
import { messageUpdate } from '../events/messageUpdate'
import { Log } from './Logger'
import { CommandManager } from './managers/CommandManager'
import { ConfigManager } from './managers/ConfigManager'
import { SubprocessManager } from './managers/SubprocessManager'

export class BotClient extends Client {
  public config: {
    ownerID: string
    prefix: string
    token: string
    trustedUsers: string[]
  }

  public p: string | undefined
  public commandManager: CommandManager
  public subprocessManager: SubprocessManager

  constructor() {
    super()

    this.config = config
    // Log discord warnings
    this.on('warn', (info) => console.log(`warn: ${info}`))
    this.on('shardReconnecting', () => Log.warn('Nezuko', 'Reconnecting to Discord'))
    this.on('shardResumed', () => Log.warn('Nezuko', 'Reconnected to Discord'))

    // Unhandled Promise Rejections
    process.on('unhandledRejection', (reason: any) => Log.error('Unhandled Rejection', reason.stack))
    // Unhandled Errors
    process.on('uncaughtException', (error) => Log.error('Uncaught Exception', error))
  }

  /**
   * Starts Altair
   */
  public async start() {
    Log.info('Copyright callmekory 2020', 'https://github.com/callmekory')

    // Login
    await this.login(this.config.token)
    Log.ok('Nezuko Ready', `Username is [ ${this.user.tag} ]`)

    // Set activity to `Listening to PREFIX`
    await this.user.setActivity(`${config.prefix}`, { type: 'LISTENING' })

    Log.info('Bot Invite Link', `${await this.generateInvite()}\n`)

    // Handle general config
    await ConfigManager.handleGeneralConfig()

    const guilds = this.guilds.cache.map((guild) => guild.id)

    for (const guildID of guilds) {
      const guild = this.guilds.cache.get(guildID)

      // Handle server configs
      await ConfigManager.handleServerConfig(guild)
    }

    // * ---------- start subprocess and command managers ----------

    this.commandManager = new CommandManager(this)
    this.subprocessManager = new SubprocessManager(this)

    // * ---------- Events ----------

    this.on('message', async (message: NezukoMessage) => await onMessage(message, this))
    this.on('messageUpdate', async (old: Message, _new: NezukoMessage) => await messageUpdate(old, _new, this))
    this.on('guildMemberAdd', async (member: GuildMember) => await guildMemberAdd(member))
    this.on('guildMemberRemove', async (member: GuildMember) => await guildMemberRemove(member))
  }
}
