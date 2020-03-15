/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Collection, Message } from 'discord.js'
import Enmap from 'enmap'
import fs from 'fs'
import table from 'markdown-table'
import { join } from 'path'
import { NezukoMessage } from 'typings'
import config from '../../config/config.json'
import { Command } from '../base/Command'
import { BotClient } from '../BotClient'
import { database } from '../database/database'
import { Log } from '../Logger'
import { Utils } from '../Utils'
import { ConfigManager } from './ConfigManager'

export class CommandManager {
  public client: BotClient
  public commands: Enmap<string | number, any>
  public aliases: Enmap<string | number, any>
  public prefix: string
  public ownerID: string
  public loadedCommands: number
  public cooldowns: any
  public table: any[]

  constructor(client: BotClient) {
    this.client = client

    if (!this.client || !(this.client instanceof BotClient)) {
      throw new Error('Nezuko Client is required')
    }

    this.table = [['Category', 'Command', 'Description']]
    this.commands = new Enmap()
    this.aliases = new Enmap()
    this.ownerID = client.config.ownerID
    this.loadedCommands = 0
    this.loadCommands()

    this.cooldowns = new Collection()
  }

  /**
   * Loads commands
   * @param directory Directory of command files
   */
  public loadCommands(directory = join(__dirname, '..', '..', 'commands')) {
    // Find all files in command directory ending in .js
    const cmdFiles = Utils.findNested(directory, '.js')

    // For each of those files send them to be loaded
    for (const file of cmdFiles) this.startModule(file)

    // Log how many commands were loaded
    Log.ok('Command Manager', `Loaded [ ${this.loadedCommands} ] commands`)
    fs.writeFileSync('table.md', table(this.table))
  }

  /**
   * Finds all commands in target dir and attempts to load them
   * @param location Directory Command module
   */
  public startModule(location: string) {
    // Import command class
    const cmd = require(location).default
    // Create a new instance of command
    const instance = new cmd(this.client)

    // Get comamnd name
    const commandName = instance.name.toLowerCase()

    // Assign location to command instance
    instance.location = location

    // If command is marked disabled dont load
    if (instance.disabled) return
    this.table.push([instance.category, instance.name, instance.description])

    // If a command with the same name attempts to be loaded error out
    if (this.commands.has(commandName)) {
      Log.warn('Start Module', `"${commandName}" already exists!`)
      throw new Error('Commands cannot have the same name')
    }

    instance.aliases.forEach((alias: string) => {
      // If a command shares the same aliases as another error out
      if (this.aliases.has(alias)) {
        throw new Error(`Commands cannot share aliases: ${instance.name} has ${alias}`)
      }

      // Else assign alias globally
      this.aliases.set(alias, instance)
    })

    // Assign command globally
    this.commands.set(commandName, instance)

    // Add 1 to global command count
    this.loadedCommands++
  }

  /**
   * Runs specified command
   * @param client BotClient
   * @param command
   * @param msg
   * @param args
   * @returns
   */
  public async runCommand(client: BotClient, command: any, msg: NezukoMessage | null, args?: any[]) {
    msg.channel.startTyping()
    command.run(client, msg, args)
    return setTimeout(() => msg.channel.stopTyping(true), 1000)
  }

  /**
   * Finds and return specified command
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
    const { content, author, channel, guild } = msg

    // If message author is the bot then ignore it
    if (msg.author.bot) return

    // Initialize member config if it doesnt exist in the database
    await ConfigManager.handleMemberConfig(msg)

    // Assign prefix
    this.prefix = guild ? await ConfigManager.handleServerConfig(guild) : config.prefix
    client.p = this.prefix
    msg.p = this.prefix

    // If message doesnt start with assigned prefix
    if (!content.startsWith(this.prefix)) return

    // Anything after command becomes a list of args
    const args = content.slice(this.prefix.length).split(' ')

    // Get requested command name
    const requestedCommandName = args.shift()!.toLowerCase()

    // Find the requested command
    const command = this.findCommand(requestedCommandName) as Command

    // If command doesnt exist then notify user and do nothing
    if (!command) return

    // If command is ran from a DM and user isn't the owner notify
    if (msg.channel.type === 'dm' && msg.author.id !== this.ownerID) {
      Log.info(
        'Command Manager',
        `User [ ${author.username} ] tried to run command [ ${requestedCommandName} ] in a DM`
      )
      return Utils.warningMessage(msg, "Commands cannot be ran in DM's")
    }

    // Check if command is on cooldown for user
    if (await this.onCooldown(msg, command)) return

    // Check if user is either the owner or a exempt user
    if (await this.isNotOwnerOrExempt(msg, command, requestedCommandName, args)) {
      // If user is neither excempt or the bot owner check if the command is locked
      if (await this.commandLocked(msg, command, requestedCommandName, args)) {
        return
      }
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

    // Assign command manager instance to msg.context
    msg.context = this

    // Run command
    Log.info('Command Manager', `[ ${author.tag} ] => [ ${msg.content.slice(this.prefix.length)} ]`)

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
            `Please wait [ ${timeLeft.toFixed(1)} ] more second(s) before reusing the [ \`${command.name}\` ] command`
          )
        )
        return true
      }
    }
    // Add user and time to command cooldown
    timestamps.set(msg.author.id, now)
  }

  /**
   * Checks if a command is locked from non authorized user access
   * @param msg
   * @param command
   * @param requestedCommandName
   * @param args
   */
  private async commandLocked(msg: Message, command: Command, requestedCommandName: string, args: string[]) {
    // Load config database
    const db = await database.models.Configs.findOne({ where: { id: config.ownerID } })

    // Read lockedCommands from db
    const { lockedCommands } = JSON.parse(db.get('config') as string)

    // TODO add checks for per server locked and disabled commands
    // Check if command is locked
    let locked = false
    let lockedMessage = ''

    // Check each command to see if it is locked
    lockedCommands.forEach((c) => {
      // If command is locked
      if (command.name === c.command || command.aliases.includes(requestedCommandName)) {
        lockedMessage = requestedCommandName
        locked = true
      }
      // If command usage is locked
      else if (`${requestedCommandName} ${args.join(' ')}` === c.command) {
        lockedMessage = `${requestedCommandName} ${args.join(' ')}`
        locked = true
      }
    })

    // If command or usage is locked and user isn't excempt
    if (locked && !config.exemptUsers.includes(msg.author.id)) {
      // Notify that command is locked
      Log.info('Command Manager', `[ ${msg.author.tag} ] tried to run locked command [ ${lockedMessage} ]`)
      return Utils.warningMessage(msg, `Command [ ${lockedMessage} ] is locked`)
    }
  }

  private async commandDisabled(msg: Message, command: Command, requestedCommandName: string) {
    // Load config database
    const db = await database.models.Configs.findOne({ where: { id: config.ownerID } })

    // Load disabldCommands from db
    const { disabledCommands } = JSON.parse(db.get('config') as string)

    // Check if command is disabled
    for (const c of disabledCommands) {
      // If command is ldisabled then notify user
      if (command.name === c.command || c.aliases.includes(requestedCommandName)) {
        return Utils.warningMessage(msg, `Command [ ${requestedCommandName} ] is disabled`)
      }
    }
  }

  /**
   * Check if a command is guild only and ran outside of a guild
   * @param msg
   * @param command
   */
  private async isGuildOnly(msg: Message, command: Command) {
    // If command is guildOnly and not ran in a guild channel
    if (command.guildOnly && msg.channel.type !== 'text') {
      // Notify user that command can only be ran inside of a guild
      Log.info(
        'Command Manager',
        `[ ${msg.author.tag} ] tried to run [ ${msg.content.slice(this.prefix.length)} ] in a DM`
      )

      // Log command was attempted
      return Utils.standardMessage(msg, 'yellow', `This command only works inside of guilds`)
    }
  }

  /**
   * Check if the message author or bot is missing permissions required for the requested command
   * @param msg
   * @param command
   */
  private async missingPerms(msg: Message, command: Command) {
    // If command requires specific permissiong
    if (command.permsNeeded) {
      // Check which permissions the user is missing
      const userMissingPerms = Utils.checkPerms(msg.member, command.permsNeeded)

      // If user is missing perms
      if (userMissingPerms.length) {
        // Notify use of the permissions they lack
        await msg.reply(
          Utils.embed(msg, 'red')
            .setTitle('You lack the perms')
            .setDescription(`**- ${userMissingPerms.join('\n - ')}**`)
            .setFooter('Message will self destruct in 30 seconds')
        )

        // Log that user tried to run command yet lacked the perms needed
        Log.info(
          'Command Manager',
          `[ ${msg.author.tag} ] tried to run [ ${msg.content.slice(
            this.prefix.length
          )} ] but lacks the perms [ ${userMissingPerms.join(', ')} ]`
        )
        return true
      }

      // Check which permissions the bot is missing
      const botMissingPerms = Utils.checkPerms(msg.guild.me, command.permsNeeded)

      // If bot is missing perms
      if (botMissingPerms.length) {
        // Notify the user of the perms needed for command
        await msg.channel.send(
          Utils.embed(msg, 'red')
            .setTitle('I lack the perms needed to perform that action')
            .setFooter('Message will self destruct in 30 seconds')
            .setDescription(`**- ${botMissingPerms.join('\n - ')}**`)
        )

        // Log which perms the bot needed for command
        Log.info(
          'Command Manager',
          `I lack the perms  [ ${msg.content.slice(this.prefix.length)} ] for command [ ${userMissingPerms.join(
            ', '
          )} ]`
        )
        return true
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
      // Log that the user tried to run the command without arguments
      Log.info('Command Manager', `[ ${msg.author.tag} ] tried to run [ ${command.name} ] without parameters`)

      // Notify the user of the arguments needed for the command
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
  private async isNotOwnerOrExempt(msg: Message, command: Command, requestedCommandName: string, args: string[]) {
    // Checks for non owner user
    if (msg.author.id !== config.ownerID && !config.exemptUsers.includes(msg.author.id)) {
      // If command is marked 'ownerOnly: true' then don't execute
      if (command.ownerOnly && !config.exemptUsers.includes(msg.author.id)) {
        // Log that the user tried to run a owner only command
        Log.info(
          'Command Manager',
          `[ ${msg.author.tag} ] tried to run owner only command [ ${msg.content.slice(this.prefix.length)} ]`
        )

        // Notify user that command is owner only
        return Utils.errorMessage(msg, `This command is reserved for my Senpai`)
      }
    }
  }
}
