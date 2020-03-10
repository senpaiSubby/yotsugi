/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Collection, Message } from 'discord.js'
import Enmap from 'enmap'
import { join } from 'path'
import { NezukoMessage } from 'typings'

import config from '../../config/config.json'
import { Command } from '../base/Command'
import { BotClient } from '../BotClient'
import { generalConfig, serverConfig } from '../database/database'
import { Log } from '../Logger'
import { Utils } from '../Utils'

import { ConfigManager } from './ConfigManager'

export class CommandManager {
  public client: BotClient
  // tslint:disable-next-line:variable-name
  public Log: typeof Log
  public commands: Enmap<string | number, any>
  public aliases: Enmap<string | number, any>
  public prefix: string
  public ownerID: string
  public loadedCommands: number
  public cooldowns: any

  constructor(client: BotClient) {
    this.client = client

    if (!this.client || !(this.client instanceof BotClient)) {
      throw new Error('Nezuko Client is required')
    }

    this.Log = client.Log
    this.commands = new Enmap()
    this.aliases = new Enmap()
    this.ownerID = client.config.ownerID
    this.loadedCommands = 0
    this.loadCommands()

    // First, this must be at the top level of your code, **NOT** in any event!
    this.cooldowns = new Collection()
  }

  /**
   * Loads commands
   * @param directory Directory of command files
   */
  public loadCommands(directory = join(__dirname, '..', '..', 'commands')) {
    const cmdFiles = this.client.Utils.findNested(directory, '.js')
    for (const file of cmdFiles) this.startModule(file)

    this.Log.ok('Command Manager', `Loaded [ ${this.loadedCommands} ] commands`)
  }

  /**
   * Starts module
   * @param location Directory Command module
   */
  public startModule(location: string) {
    const cmd = require(location).default
    const instance = new cmd(this.client)

    const commandName = instance.name.toLowerCase()
    instance.location = location

    if (instance.disabled) return

    if (this.commands.has(commandName)) {
      this.Log.warn('Start Module', `"${commandName}" already exists!`)
      throw new Error('Commands cannot have the same name')
    }

    instance.aliases.forEach((alias: string) => {
      if (this.aliases.has(alias)) {
        throw new Error(
          `Commands cannot share aliases: ${instance.name} has ${alias}`
        )
      }

      this.aliases.set(alias, instance)
    })

    this.commands.set(commandName, instance)
    this.loadedCommands++
  }

  /**
   * Reloads commands
   */
  public reloadCommands() {
    this.Log.warn('Reload Manager', 'Clearing Module Cache')
    this.commands = new Enmap()
    this.aliases = new Enmap()
    this.Log.warn('Reload Manager', 'Reinitialising Modules')
    this.loadCommands(`${__dirname}/../commands`)
    this.Log.ok('Reload Manager', 'Reload Commands Success')
    return true
  }

  /**
   * Reloads command
   * @param commandName Command to reload
   */
  public reloadCommand(commandName: string) {
    const existingCommand =
      this.commands.get(commandName) || this.aliases.get(commandName)
    if (!existingCommand) return false
    for (const alias of existingCommand.aliases) this.aliases.delete(alias)
    this.commands.delete(commandName)
    delete require.cache[require.resolve(existingCommand.location)]
    this.startModule(existingCommand.location)
    return true
  }

  /**
   * Runs command
   * @param client BotClient
   * @param command
   * @param msg
   * @param args
   * @param [api]
   * @returns
   */
  public async runCommand(
    client: BotClient,
    command: any,
    msg: NezukoMessage | null,
    args?: any[],
    api?: boolean
  ) {
    if (api) {
      msg = ({
        channel: null,
        author: null,
        context: this
      } as unknown) as NezukoMessage
      return command.run(client, msg, args, api)
    }

    msg.channel.startTyping()
    command.run(client, msg, args, api)
    return setTimeout(async () => msg.channel.stopTyping(true), 1000)
  }

  /**
   * Finds command
   * @param commandName Command to get
   */
  public findCommand(commandName: string) {
    return this.commands.get(commandName) || this.aliases.get(commandName)
  }

  /**
   * Handles message
   * @param msg NezukoMessage
   * @param client BotClient
   */
  public async handleMessage(msg: NezukoMessage, client: BotClient) {
    const { standardMessage } = Utils
    const { content, author, channel, guild } = msg

    // TODO move this a word detection method
    if (content.startsWith('oof')) await channel.send('BIG OOF')

    // If message author is the bot then ignore it
    if (msg.author.bot) return

    // Initialize member config if it doesnt exist in the database
    await ConfigManager.handleMemberConfig(msg)

    // Assign prefix
    this.prefix = guild
      ? await ConfigManager.handleServerConfig(guild)
      : config.prefix
    client.p = this.prefix
    msg.p = this.prefix

    // If message doesnt start with assigned prefix
    if (!content.startsWith(this.prefix)) {
      if (
        (channel.type !== 'dm' && !content.startsWith(this.prefix)) ||
        content.length < this.prefix.length
      ) {
        // If bot is mentioned then reply with prefix
        if (content.startsWith(`<@${client.user.id}>`)) {
          const m = (await standardMessage(
            msg,
            'green',
            `Heya! My prefix is [ ${this.prefix} ] if you'd like to chat ;)`
          )) as Message
          return m.delete(5000)
        }
      }
    }

    // Anything after command becomes a list of args
    const args = content.slice(this.prefix.length).split(' ')
    // Get requested command name
    const requestedCommandName = args.shift()!.toLowerCase()
    // Find the requested command
    const command = this.findCommand(requestedCommandName) as Command
    // If command doesnt exist then notify user and do nothing
    if (!command) return

    // Check if command is on cooldown for user
    if (await this.onCooldown(msg, command)) return
    // Check if user is either the owner or a exempt user
    if (
      await this.isNotOwnerOrExempt(msg, command, requestedCommandName, args)
    ) {
      return
    }
    // Check if the command is disabled
    if (await this.commandDisabled(msg, command, requestedCommandName)) return
    // Check if command is guild only
    if (await this.isGuildOnly(msg, command)) return
    // Check if user or bot is missing permissions for command actions
    if (await this.missingPerms(msg, command)) return
    // Check if requested command is missing arguments
    if (await this.missingArgs(msg, command, args)) return

    // * -------------------- Run Command --------------------
    Log.info(
      'Command Manager',
      `[ ${author.tag} ] => [ ${msg.content.slice(this.prefix.length)} ]`
    )

    // Assign general config to client for use in commands
    const generalDB = await generalConfig(this.ownerID)

    if (generalDB) {
      client.db.config = JSON.parse(generalDB.get('config') as string)
    }

    // Assign server config to client for use in commands
    if (guild) {
      const serverDB = await serverConfig(guild ? guild.id : null)

      if (serverDB) {
        client.db.server = JSON.parse(serverDB.get('config') as string)
      }
    }

    msg.context = this
    return this.runCommand(client, command, msg, args)
  }

  /**
   * Check if command is on cooldown for the message author
   * @param msg BotMessage
   * @param command Command
   */
  private async onCooldown(msg, command: Command) {
    // If command isn't in cooldown then set it
    if (!this.cooldowns.has(command.name)) {
      this.cooldowns.set(command.name, new Collection())
    }

    // Get current date
    const now = Date.now()
    // Get time the last command was ran
    const timestamps = this.cooldowns.get(command.name)
    // Get cooldown time from command
    const cooldownAmount = command.cooldown * 1000

    // If command is in cooldown
    if (timestamps.has(msg.author.id)) {
      // Get time left till command can be ran again
      const expirationTime = timestamps.get(msg.author.id) + cooldownAmount
      // If cooldown time hasn't passed then notify user
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        await msg.reply(
          Utils.warningMessage(
            msg,
            `Please wait [ ${timeLeft.toFixed(
              1
            )} ] more second(s) before reusing the [ \`${
              command.name
            }\` ] command`
          )
        )
        return true
      }
    }
    // Add user to command cooldown
    timestamps.set(msg.author.id, now)
  }

  /**
   * Checks if a command is locked from non authorized user access
   * @param msg
   * @param command
   * @param requestedCommandName
   * @param args
   */
  private async commandLocked(
    msg: Message,
    command: Command,
    requestedCommandName: string,
    args: string[]
  ) {
    const db = await generalConfig(config.ownerID)

    const { lockedCommands } = JSON.parse(db.get('config') as string)

    // TODO add checks for per server locked and disabled commands
    // Check if command is locked
    let locked = false
    let lockedMessage = ''

    lockedCommands.forEach((c) => {
      if (
        command.name === c.command ||
        command.aliases.includes(requestedCommandName)
      ) {
        lockedMessage = requestedCommandName
        locked = true
      } else if (`${requestedCommandName} ${args.join(' ')}` === c.command) {
        lockedMessage = `${requestedCommandName} ${args.join(' ')}`
        locked = true
      }
    })

    if (locked && !config.exemptUsers.includes(msg.author.id)) {
      Log.info(
        'Command Manager',
        `[ ${msg.author.tag} ] tried to run locked command [ ${lockedMessage} ]`
      )
      return Utils.warningMessage(msg, `Command [ ${lockedMessage} ] is locked`)
    }
  }

  private async commandDisabled(
    msg: Message,
    command: Command,
    requestedCommandName: string
  ) {
    const db = await generalConfig(config.ownerID)

    const { disabledCommands } = JSON.parse(db.get('config') as string)
    // Check if command is disabled
    for (const c of disabledCommands) {
      if (
        command.name === c.command ||
        c.aliases.includes(requestedCommandName)
      ) {
        return Utils.warningMessage(
          msg,
          `Command [ ${requestedCommandName} ] is disabled`
        )
      }
    }
  }

  /**
   * Check if a command is guild only and ran outside of a guild
   * @param msg
   * @param command
   */
  private async isGuildOnly(msg: Message, command: Command) {
    // If guildOnly and not ran in a guild channel
    if (command.guildOnly && msg.channel.type !== 'text') {
      Log.info(
        'Command Manager',
        `[ ${msg.author.tag} ] tried to run [ ${msg.content.slice(
          this.prefix.length
        )} ] in a DM`
      )
      return Utils.standardMessage(
        msg,
        'green',
        `This command cannot be slid into my DM`
      )
    }
  }

  /**
   * Check if the message author or bot is missing permissions required for the requested command
   * @param msg
   * @param command
   */
  private async missingPerms(msg: Message, command: Command) {
    // Check if user and bot has all required perms in permsNeeded
    if (msg.channel.type !== 'dm') {
      if (command.permsNeeded) {
        const userMissingPerms = Utils.checkPerms(
          msg.member,
          command.permsNeeded
        )
        const botMissingPerms = Utils.checkPerms(
          msg.guild.me,
          command.permsNeeded
        )

        if (userMissingPerms.length) {
          Log.info(
            'Command Manager',
            `[ ${msg.author.tag} ] tried to run [ ${msg.content.slice(
              this.prefix.length
            )} ] but lacks the perms [ ${userMissingPerms.join(', ')} ]`
          )

          const m = (await msg.reply(
            Utils.embed(msg, 'red')
              .setTitle('You lack the perms')
              .setDescription(`**- ${userMissingPerms.join('\n - ')}**`)
              .setFooter('Message will self destruct in 30 seconds')
          )) as Message
          return m.delete(10000)
        }

        if (botMissingPerms.length) {
          Log.info(
            'Command Manager',
            `I lack the perms  [ ${msg.content.slice(
              this.prefix.length
            )} ] for command [ ${userMissingPerms.join(', ')} ]`
          )

          const m = (await msg.channel.send(
            Utils.embed(msg, 'red')
              .setTitle('I lack the perms needed to perform that action')
              .setFooter('Message will self destruct in 30 seconds')
              .setDescription(`**- ${botMissingPerms.join('\n - ')}**`)
          )) as Message
          return m.delete(10000)
        }
      }
    }
  }

  /**
   * Check if command requires arguments but none were specified
   * @param msg
   * @param command
   * @param args
   */
  private async missingArgs(msg: Message, command: Command, args: string[]) {
    // If command requires args but none specified
    if (command.args && !args.length) {
      Log.info(
        'Command Manager',
        `[ ${msg.author.tag} ] tried to run [ ${command.name} ] without parameters`
      )

      const m = (await msg.reply(
        Utils.embed(msg, 'yellow')
          .setTitle('Command requires parameters')
          .setFooter('Message will self destruct in 30 seconds')
          .setDescription(
            `**__You can edit your last message instead of sending a new one!__**

            *Example Usage**

            \`\`\`css\n${command.usage.join('\n')}\`\`\``
          )
      )) as Message

      return m.delete(10000)
    }
  }

  /**
   * Check if the command requested is NOT either the owner or a exempt member to run this command
   * @param msg
   * @param command
   * @param requestedCommandName
   * @param args
   */
  private async isNotOwnerOrExempt(
    msg: Message,
    command: Command,
    requestedCommandName: string,
    args: string[]
  ) {
    // Checks for non owner user
    if (
      msg.author.id !== config.ownerID &&
      !config.exemptUsers.includes(msg.author.id)
    ) {
      // If command is marked 'ownerOnly: true' then don't execute
      if (command.ownerOnly && !config.exemptUsers.includes(msg.author.id)) {
        Log.info(
          'Command Manager',
          `[ ${
            msg.author.tag
          } ] tried to run owner only command [ ${msg.content.slice(
            this.prefix.length
          )} ]`
        )

        return Utils.errorMessage(msg, `This command is reserved for my Senpai`)
      }

      if (await this.commandLocked(msg, command, requestedCommandName, args)) {
        return
      }
    }
  }
}
