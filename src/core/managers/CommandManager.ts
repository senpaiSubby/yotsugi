/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Message } from 'discord.js'
import Enmap from 'enmap'
import { join } from 'path'
import { NezukoMessage } from 'typings'
import { database } from '../database/database'
import { NezukoClient } from '../NezukoClient'
import { Log } from '../utils/Logger'
import { ConfigManager } from './ConfigManager'
import { LevelManager } from './LevelManager'
import { MessageManager } from './MessageManager'

export class CommandManager {
  public client: NezukoClient
  // tslint:disable-next-line:variable-name
  public Log: typeof Log
  public commands: Enmap<string | number, any>
  public aliases: Enmap<string | number, any>
  public prefix: string
  public ownerID: string

  constructor(client: NezukoClient) {
    this.client = client
    this.Log = client.Log
    this.commands = new Enmap()
    this.aliases = new Enmap()
    this.prefix = client.config.prefix
    this.ownerID = client.config.ownerID

    this.loadCommands()

    if (!this.client || !(this.client instanceof NezukoClient)) {
      throw new Error('Discord Client is required')
    }
  }

  /**
   * Loads commands
   * @param directory Directory of command files
   */
  public loadCommands(directory = join(__dirname, '..', '..', 'commands')) {
    const cmdFiles = this.client.Utils.findNested(directory, '.js')
    for (const file of cmdFiles) this.startModule(file)
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

    this.commands.set(commandName, instance)
    this.Log.ok('Command Manager', `Loaded [ ${commandName} ]`)

    instance.aliases.forEach((alias: string) => {
      if (this.aliases.has(alias)) {
        throw new Error(`Commands cannot share aliases: ${instance.name} has ${alias}`)
      } else this.aliases.set(alias, instance)
    })
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
    const existingCommand = this.commands.get(commandName) || this.aliases.get(commandName)
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
      msg = ({ channel: null, author: null, context: this } as unknown) as NezukoMessage
      return command.run(client, msg, args, api)
    }

    if (msg) {
      msg.channel.startTyping()
      command.run(client, msg, args, api)
      return msg.channel.stopTyping(true)
    }
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
  public async handleMessage(msg: NezukoMessage, client: NezukoClient, addLevel = false) {
    if (msg.author.bot) return

    // * -------------------- Setup --------------------

    const { Utils } = client
    const { errorMessage, warningMessage, standardMessage, embed } = Utils
    const { content, author, channel, guild } = msg
    const { ownerID } = client.config
    msg.context = this

    // * -------------------- Parse & Log Messages --------------------

    // Log and parse all messages in DM's and guilds
    await MessageManager.log(client, msg)

    // * -------------------- Assign Prefix --------------------

    const prefix = guild ? await ConfigManager.handleServerConfig(guild) : this.prefix
    client.p = prefix
    msg.p = prefix

    // * -------------------- Handle Levels --------------------
    // Give exp per message sent in server
    if (addLevel) await new LevelManager(client, msg).manage()

    // If message doesnt start with Nezuko's prefix then ignore
    if (!content.startsWith(prefix)) {
      if ((channel.type !== 'dm' && !content.startsWith(prefix)) || content.length < 2) {
        const memberMentioned = msg.mentions.members.first()

        if (memberMentioned && memberMentioned.user.id === client.user.id) {
          return standardMessage(msg, `Heya! My prefix is [ ${prefix} ] if you'd like to chat ;)`)
        }
      }
      return
    }

    // * -------------------- Handle DB Configs --------------------
    await ConfigManager.handleMemberConfig(msg)

    // Assign general config to client for use in commands
    const generalDB = await database.models.GeneralConfig.findOne({
      where: { id: ownerID }
    })

    if (generalDB) client.db.config = JSON.parse(generalDB.get('config') as string)

    // Assign server config to client for use in commands
    if (guild) {
      const serverDB = await database.models.ServerConfig.findOne({
        where: { id: guild ? guild.id : null }
      })

      if (serverDB) client.db.server = JSON.parse(serverDB.get('config') as string)
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
    else commandName = args.shift()!.toLowerCase()

    // Find the requested command
    const command = this.findCommand(commandName)

    // If command doesnt exist then notify user and do nothing
    if (!command) return errorMessage(msg, `No command: [ ${commandName} ]`)

    // Else continue with the rest of our checks
    {
      // Assign the command name to be forwarded with the message object
      msg.command = command.name

      // * -------------------- Command Option Checks --------------------

      // Checks for non owner users
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

        const { lockedCommands } = client.db.config!

        // Check all aliases for locked commands
        const possibleCommands = []

        this.commands.forEach((i) => {
          possibleCommands.push(i.name)
          if (i.aliases) i.aliases.forEach((a: string) => possibleCommands.push(a))
        })

        lockedCommands.forEach((c) => {
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
      const { disabledCommands } = client.db.config!

      disabledCommands.forEach((c) => {
        if (command.name === c.command || c.aliases.includes(commandName)) {
          disabled = true
        }
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
          const userMissingPerms = Utils.checkPerms(msg.member, command.permsNeeded)
          const botMissingPerms = Utils.checkPerms(msg.guild.me, command.permsNeeded)

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
              )} ] for command [ ${userMissingPerms.join(', ')} ]`
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
          `[ ${author.tag} ] tried to run [ ${msg.content.slice(
            prefix.length
          )} ] without parameters`
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
  }
}
