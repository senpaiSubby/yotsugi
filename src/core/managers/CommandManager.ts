/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Collection, Message } from 'discord.js'
import Enmap from 'enmap'
import path, { join } from 'path'
import { NezukoMessage, ServerDBConfig } from 'typings'

import config from '../../config/config.json'
import { Command } from '../base/Command'
import { database, generalConfig, serverConfig } from '../database/database'
import { Log } from '../Logger'
import { NezukoClient } from '../NezukoClient'
import { ConfigManager } from './ConfigManager'

export class CommandManager {
  public client: NezukoClient
  // tslint:disable-next-line:variable-name
  public Log: typeof Log
  public commands: Enmap<string | number, any>
  public aliases: Enmap<string | number, any>
  public prefix: string
  public ownerID: string
  public loadedCommands: number
  public cooldowns: any

  constructor(client: NezukoClient) {
    this.client = client

    if (!this.client || !(this.client instanceof NezukoClient)) {
      throw new Error('Nezuko Client is required')
    }

    this.Log = client.Log
    this.commands = new Enmap()
    this.aliases = new Enmap()
    this.prefix = client.config.prefix
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
    for (const file of cmdFiles) {
      const dirName = path.basename(path.dirname(file))

      this.startModule(file)
    }
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
   * @param client NezukoClient
   * @param command
   * @param msg
   * @param args
   * @param [api]
   * @returns
   */
  public async runCommand(
    client: NezukoClient,
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
   * @param client NezukoClient
   */
  public async handleMessage(
    msg: NezukoMessage,
    client: NezukoClient,
    addLevel = false
  ) {
    // * -------------------- Setup --------------------

    const { Utils } = client
    const { errorMessage, warningMessage, standardMessage, embed } = Utils
    const { content, author, channel, guild } = msg
    const { ownerID } = client.config
    msg.context = this

    if (content.startsWith('oof')) await channel.send('BIG OOF')

    if (msg.author.bot) return

    // * -------------------- Assign Prefix --------------------

    const SDB = await database.models.Servers.findOne({
      where: { id: guild.id }
    })
    const { leveling } = JSON.parse(
      SDB.get('config') as string
    ) as ServerDBConfig

    const prefix = guild
      ? await ConfigManager.handleServerConfig(guild)
      : this.prefix
    client.p = prefix
    msg.p = prefix

    if (client.user.presence.game.name !== prefix) {
      await client.user.setActivity(`${prefix}`, { type: 'LISTENING' })
    }

    // * -------------------- Pre Checks --------------------

    // If message doesnt start with assigned prefix
    if (!content.startsWith(prefix)) {
      if (
        (channel.type !== 'dm' && !content.startsWith(prefix)) ||
        content.length < prefix.length
      ) {
        // If bot is mentioned then reply with prefix
        const memberMentioned = msg.mentions.members.first()
        if (content.startsWith(`<@${client.user.id}>`)) {
          const m = (await standardMessage(
            msg,
            'green',
            `Heya! My prefix is [ ${prefix} ] if you'd like to chat ;)`
          )) as Message
          return m.delete(5000)
        }
      }
      return
    }

    // * -------------------- Find Command & Parse Args --------------------

    // Anything after command becomes a list of args
    let args = content.slice(prefix.length).split(' ')

    let commandName: string

    // Check if the user asks for help after the command name
    // Ex: 'level help'
    // If so give them the help command for the original command
    if (args[1] === 'help') {
      commandName = 'help'
      args = [args[0]]
    } // Else continue with requested command
    else {
      commandName = args.shift()!.toLowerCase()
    }

    // Find the requested command
    const command = this.findCommand(commandName) as Command

    // If command doesnt exist then notify user and do nothing
    if (!command) {
      const m = (await errorMessage(
        msg,
        `No command: [ ${commandName} ]`
      )) as Message
      return m.delete(5000)
    }

    // * -------------------- Handle DB Configs --------------------
    await ConfigManager.handleMemberConfig(msg)

    // Assign general config to client for use in commands
    const generalDB = await generalConfig(ownerID)

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

    const { lockedCommands, disabledCommands } = client.db.config!

    // * -------------------- Command Option Checks --------------------

    // * -------------------- Command Cooldowns --------------------
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
    if (timestamps.has(author.id)) {
      // Get time left till command can be ran again
      const expirationTime = timestamps.get(author.id) + cooldownAmount
      // If cooldown time hasn't passed then notify user
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        return msg.reply(
          warningMessage(
            msg,
            `Please wait [ ${timeLeft.toFixed(
              1
            )} ] more second(s) before reusing the [ \`${
              command.name
            }\` ] command`
          )
        )
      }
    }
    // Add user to command cooldown
    timestamps.set(author.id, now)

    // Checks for non owner user
    if (author.id !== ownerID || !config.exemptUsers.includes(author.id)) {
      // If command is marked 'ownerOnly: true' then don't execute
      if (command.ownerOnly && !config.exemptUsers.includes(author.id)) {
        Log.info(
          'Command Manager',
          `[ ${
            author.tag
          } ] tried to run owner only command [ ${msg.content.slice(
            prefix.length
          )} ]`
        )

        return errorMessage(msg, `This command is reserved for my Senpai`)
      }

      // Check if command is locked
      let locked = false
      let lockedMessage = ''

      lockedCommands.forEach((c) => {
        if (commandName === c.command || command.aliases.includes(c.command)) {
          lockedMessage = commandName
          locked = true
        } else if (`${commandName} ${args.join(' ')}` === c.command) {
          lockedMessage = `${commandName} ${args.join(' ')}`
          locked = true
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

    // Check if command is disabled
    for (const c of disabledCommands) {
      if (command.name === c.command || c.aliases.includes(commandName)) {
        return warningMessage(msg, `Command [ ${commandName} ] is disabled`)
      }
    }

    // If guildOnly and not ran in a guild channel
    if (command.guildOnly && channel.type !== 'text') {
      Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run [ ${msg.content.slice(
          prefix.length
        )} ] in a DM`
      )
      return standardMessage(
        msg,
        'green',
        `This command cannot be slid into my DM`
      )
    }

    // Check if user and bot has all required perms in permsNeeded
    if (channel.type !== 'dm') {
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
            `[ ${author.tag} ] tried to run [ ${msg.content.slice(
              prefix.length
            )} ] but lacks the perms [ ${userMissingPerms.join(', ')} ]`
          )

          const m = (await msg.reply(
            embed(msg, 'red')
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
              prefix.length
            )} ] for command [ ${userMissingPerms.join(', ')} ]`
          )

          const m = (await channel.send(
            embed(msg, 'red')
              .setTitle('I lack the perms needed to perform that action')
              .setFooter('Message will self destruct in 30 seconds')
              .setDescription(`**- ${botMissingPerms.join('\n - ')}**`)
          )) as Message
          return m.delete(10000)
        }
      }
    }

    // If command requires args but none specified
    if (command.args && !args.length) {
      Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run [ ${command.name} ] without parameters`
      )

      const m = (await msg.reply(
        embed(msg, 'yellow')
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

    // * -------------------- Run Command --------------------
    Log.info(
      'Command Manager',
      `[ ${author.tag} ] => [ ${msg.content.slice(prefix.length)} ]`
    )
    return this.runCommand(client, command, msg, args)
  }
}
