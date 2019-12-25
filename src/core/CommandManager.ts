/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Guild, GuildMember, Message, TextChannel } from 'discord.js'

import { Command } from './Command'
import { Log } from './Logger'
import { MessageManager } from './MessageManager'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import enmap from 'enmap'

export class CommandManager {
  public client: NezukoClient
  public commands: enmap<string | number, any>
  public aliases: enmap<string | number, any>
  public prefix: string
  public ownerID: string

  constructor(client: NezukoClient) {
    this.client = client
    this.commands = new enmap()
    this.aliases = new enmap()
    this.prefix = client.config.prefix
    this.ownerID = client.config.ownerID

    if (!this.client || !(this.client instanceof NezukoClient)) {
      throw new Error('Discord Client is required')
    }
  }

  /**
   * Load all commands from folder
   * @param directory Directory containing command files
   */
  public loadCommands(directory: string): void {
    const cmdFiles = this.client.Utils.findNested(directory, '.js')
    cmdFiles.forEach((file: any) => this.startModule(file))
  }

  /**
   * Starts the command specified
   * @param location Path to command module
   */
  public startModule(location: string): void {
    // tslint:disable-next-line:variable-name
    const cmd = require(location)
    const instance = new cmd(this.client)
    const commandName = instance.name.toLowerCase()

    instance.location = location

    if (instance.disabled) return

    if (this.commands.has(commandName)) {
      Log.error('Start Module', `"${commandName}" already exists!`)
      throw new Error('Commands cannot have the same name')
    }

    this.commands.set(commandName, instance)
    Log.ok('Command Manager', `Loaded [ ${commandName} ]`)

    instance.aliases.forEach((alias: string | number) => {
      if (this.aliases.has(alias)) {
        throw new Error(`Commands cannot share aliases: ${instance.name} has ${alias}`)
      } else this.aliases.set(alias, instance)
    })
  }

  /**
   * Reload commands
   */
  public reloadCommands() {
    Log.warn('Reload Manager', 'Clearing Module Cache')
    this.commands = new enmap()
    this.aliases = new enmap()
    Log.warn('Reload Manager', 'Reinitialising Modules')
    this.loadCommands(`${__dirname}/../commands`)
    Log.ok('Reload Manager', 'Reload Commands Success')
    return true
  }

  /**
   * Reload the specified command
   * @param commandName Reload specific command
   */
  public reloadCommand(commandName: string | number): boolean {
    const existingCommand = this.commands.get(commandName) || this.aliases.get(commandName)
    if (!existingCommand) return false
    for (const alias of existingCommand.aliases) this.aliases.delete(alias)
    this.commands.delete(commandName)
    delete require.cache[require.resolve(existingCommand.location)]
    this.startModule(existingCommand.location)
    return true
  }

  /**
   * Run the specified command
   * @param client NezukoClient
   * @param command Command to run
   * @param msg Original message
   * @param args Args to pass through
   * @param api Send from API ornot?
   */
  public async runCommand(
    client: NezukoClient,
    command: any,
    msg: NezukoMessage,
    args: string[],
    api?: boolean
  ): Promise<void> {
    if (api) {
      // tslint:disable-next-line:no-parameter-reassignment
      // Msg = { channel: null as any, author: null as any, context: this }
      // return command.run(client, msg, args, api)
    }

    try {
      msg.channel.startTyping()
      command.run(client, msg, args, api)
      return msg.channel.stopTyping(true)
    } catch (err) {
      client.Utils.error(command.name, err, msg.channel as TextChannel)
      return msg.channel.stopTyping(true)
    }
  }

  /**
   * Find a command
   * @param commandName Command to find
   */
  public findCommand(commandName: string): Command {
    return this.commands.get(commandName) || this.aliases.get(commandName)
  }

  /**
   * Handle and parse recieved messages
   * @param msg Message from channel
   * @param client NezukoClient
   */
  public async handleMessage(msg: NezukoMessage, client: NezukoClient) {
    if (msg.author.bot) return

    // * -------------------- Setup --------------------

    const { Utils, generalConfig, serverConfig } = client
    const { errorMessage, warningMessage, standardMessage, embed } = Utils
    const { content, author, channel, guild } = msg
    const { ownerID } = client.config
    msg.context = this

    // * -------------------- Handle DB Configs --------------------

    const prefix = guild ? await this.handleServer(guild) : this.prefix
    client.p = prefix
    msg.p = prefix

    await this.handleUser(msg)

    // Set db configs
    const generalDB = await generalConfig.findOne({ where: { id: ownerID } })
    client.db!.config = JSON.parse(generalDB.dataValues.config)
    const serverDB = await serverConfig.findOne({ where: { id: guild.id } })
    client.db!.server = JSON.parse(serverDB.dataValues.config)

    // * -------------------- Parse & Logger Messages --------------------

    // Send all messages to our parser
    await MessageManager.log(msg)

    // * -------------------- Find Command & Parse Args --------------------

    // If msg doesnt start with prefix then ignore msg
    if (!content.startsWith(prefix) || content.length < 2) return

    // Anything after command becomes a list of args
    const args = content.slice(prefix.length).split(' ')

    // Command name without prefix
    const commandName = args.shift()!.toLowerCase()

    // Set command name and aliases
    const instance = this.findCommand(commandName)

    // If no command or alias do nothing
    if (!instance) return errorMessage(msg, `No command: [ ${commandName} ]`)

    const command = instance
    msg.command = instance.name

    // * -------------------- Command Option Checks --------------------

    if (author.id !== ownerID) {
      // If command is marked 'ownerOnly: true' then don't excecute
      if (command.ownerOnly) {
        Log.info(
          'Command Manager',
          `[ ${author.tag} ] tried to run owner only command [ ${msg.content.slice(
            prefix.length
          )} ]`
        )
        return errorMessage(msg, `This command is owner only nerd`)
      }

      // Check if command is locked
      let locked = false
      let lockedMessage = ''

      const { lockedCommands } = client.db!.config

      // Check all aliases for locked commands
      const possibleCommands = []
      this.commands.forEach((i) => {
        possibleCommands.push(i.name)
        if (i.aliases) i.aliases.forEach((a: any) => possibleCommands.push(a))
      })

      lockedCommands.forEach((c: { command: string }) => {
        if (commandName === c.command || command.aliases.includes(c.command)) {
          lockedMessage = commandName
          locked = true
        } else if (`${commandName} ${args.join(' ')}` === c.command) {
          if (`${commandName} ${args.join(' ')}` === c.command) {
            lockedMessage = `${commandName} ${args.join(' ')}`
            locked = true
          }
        }
      })

      if (locked) {
        Log.info(
          'Command Manager',
          `[ ${author.tag} ] tried to run locked command [ ${lockedMessage} ]`
        )
        return warningMessage(msg, `Command [ ${lockedMessage} ] is locked`)
      }
    }

    // Check if command is enabled
    let disabled = false
    const { disabledCommands } = client.db!.config

    disabledCommands.forEach((c: { command: any; aliases: string | any[] }) => {
      if (instance.name === c.command || c.aliases.includes(commandName)) disabled = true
    })

    if (disabled) {
      Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run disabled command[ ${msg.content.slice(prefix.length)} ]`
      )
      return warningMessage(msg, `Command [ ${commandName} ] is disabled`)
    }

    // If command is marked 'guildOnly: true' then don't excecute
    if (command.guildOnly && channel.type === 'dm') {
      Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run [ ${msg.content.slice(prefix.length)} ] in a DM`
      )
      return standardMessage(msg, `This command cannot be slid into my DM`)
    }

    // Check if user and bot has all required perms in permsNeeded
    if (channel.type !== 'dm') {
      if (command.permsNeeded) {
        const userMissingPerms = this.checkPerms(msg.member, command.permsNeeded)
        const botMissingPerms = this.checkPerms(msg.guild.me, command.permsNeeded)

        if (userMissingPerms) {
          Log.info(
            'Command Manager',
            `[ ${author.tag} ] tried to run [ ${msg.content.slice(
              prefix.length
            )} ] but lacks the perms [ ${userMissingPerms.join(', ')} ]`
          )
          return msg.reply(
            embed('red')
              .setTitle('You lack the perms')
              .setDescription(`**- ${userMissingPerms.join('\n - ')}**`)
              .setFooter('Message will self destruct in 30 seconds')
          )
        }

        if (botMissingPerms) {
          Log.info(
            'Command Manager',
            `I lack the perms  [ ${msg.content.slice(
              prefix.length
            )} ] for command [ ${userMissingPerms!.join(', ')} ]`
          )
          return channel.send(
            embed('red')
              .setTitle('I lack the perms needed to perform that action')
              .setFooter('Message will self destruct in 30 seconds')
              .setDescription(`**- ${botMissingPerms.join('\n - ')}**`)
          )
        }
      }
    }

    // If commands is marked 'args: true' run this if no args sent
    if (command.args && !args.length) {
      Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run [ ${msg.content.slice(prefix.length)} ] without parameters`
      )

      const m = (await msg.reply(
        embed('yellow')
          .setTitle('Command requires parameters')
          .setFooter('Message will self destruct in 30 seconds')
          .setDescription(
            `**__You can edit your last message instead of sending a new one!__**\n\n**Example Usage**\n\`\`\`css\n${command.usage.join(
              '\n'
            )}\`\`\``
          )
      )) as Message
      return m.delete(30000)
    }

    // * -------------------- Run Command --------------------
    Log.info(
      'Command Manager',
      `[ ${author.tag} ] ran command [ ${msg.content.slice(prefix.length)} ]`
    )
    return this.runCommand(client, command, msg, args)
  }

  /**
   * Handle per server configs
   * @param guild Guild
   */
  public async handleServer(guild: Guild): Promise<string> {
    // * -------------------- Setup --------------------
    const { id, ownerID, name } = guild
    const { serverConfig } = this.client

    // * -------------------- Handle Per Server Configs --------------------

    // Per server config
    if (!guild) return this.prefix

    let db = await serverConfig.findOne({ where: { id } })

    if (!db) {
      Log.info(
        'Handle Server',
        `Creating new server config for guild ID [ ${guild.id} ] [ ${guild.name} ]`
      )
      db = await serverConfig.create({
        id,
        ownerID,
        serverName: name,
        config: JSON.stringify({
          announcementChannel: null,
          LoggersChannel: null,
          prefix: this.prefix,
          rules: [],
          starboardChannel: null,
          welcomeChannel: null
        }),
        messages: JSON.stringify({ channels: {}, dm: {} })
      })
    }

    // * just to handle db updates when adding commands
    const conf = JSON.parse(db.config)
    if (!conf.announcementChannel) {
      conf.announcementChannel = null
      await db.update({ config: JSON.stringify(conf) })
    }

    const prefix: string = db.prefix || this.prefix
    return prefix
  }

  /**
   * Handle per user configs
   * @param msg Message
   */
  public async handleUser(msg: NezukoMessage) {
    // * -------------------- Setup --------------------
    const { author } = msg
    const { id, tag: username } = author
    const { memberConfig } = this.client

    // * -------------------- Setup --------------------

    const db = await memberConfig.findOne({ where: { id } })

    if (!db) {
      Log.info('Handle Server', `Created new member config for user [ ${id} ] [ ${username} ]`)
      await memberConfig.create({
        username,
        id,
        config: JSON.stringify({ todos: [] })
      })
    }
  }

  /**
   * Check if the specified user has the perms requested
   * @param user Guild member
   * @param permsNeeded List of permission to check
   */
  public checkPerms(user: GuildMember, permsNeeded: any[]) {
    const missingPerms: any[] = []
    permsNeeded.forEach((perm: any) => {
      if (!user.permissions.has(perm)) missingPerms.push(perm)
    })
    if (missingPerms.length) return missingPerms
  }
}
