const { Client } = require('discord.js')
const Enmap = require('enmap')
const MessageManager = require('../core/MessageManager')

module.exports = class CommandManager {
  constructor(client) {
    this.client = client
    this.Log = client.Log
    this.commands = new Enmap()
    this.aliases = new Enmap()
    this.prefix = client.config.prefix
    this.ownerID = client.config.ownerID

    if (!this.client || !(this.client instanceof Client)) {
      throw new Error('Discord Client is required')
    }
  }

  loadCommands(directory) {
    const cmdFiles = this.client.Utils.findNested(directory, '.js')
    cmdFiles.forEach((file) => this.startModule(file))
  }

  startModule(location) {
    const Command = require(location)
    const instance = new Command(this.client)
    const commandName = instance.name.toLowerCase()
    instance.location = location

    if (instance.disabled) return

    if (this.commands.has(commandName)) {
      this.Log.error('Start Module', `"${commandName}" already exists!`)
      throw new Error('Commands cannot have the same name')
    }

    this.commands.set(commandName, instance)

    for (const alias of instance.aliases) {
      if (this.aliases.has(alias)) {
        throw new Error(`Commands cannot share aliases: ${instance.name} has ${alias}`)
      } else this.aliases.set(alias, instance)
    }
  }

  reloadCommands() {
    this.Log.warn('Reload Manager', 'Clearing Module Cache')
    this.commands = new Enmap()
    this.aliases = new Enmap()
    this.Log.warn('Reload Manager', 'Reinitialising Modules')
    this.loadCommands('./commands')
    this.Log.success('Reload Manager', 'Reload Commands Success')
    return true
  }

  reloadCommand(commandName) {
    const existingCommand = this.commands.get(commandName) || this.aliases.get(commandName)
    if (!existingCommand) return false
    for (const alias of existingCommand.aliases) this.aliases.delete(alias)
    this.commands.delete(commandName)
    delete require.cache[require.resolve(existingCommand.location)]
    this.startModule(existingCommand.location, true)
    return true
  }

  async runCommand(client, command, msg, args, api = false) {
    if (api) {
      msg = { channel: null, author: null, context: this }
      return command.run(client, msg, args, api)
    }

    try {
      await msg.channel.startTyping()
      command.run(client, msg, args, api)
      return msg.channel.stopTyping(true)
    } catch (err) {
      await client.Utils.error(command.name, err, msg.channel)
      return msg.channel.stopTyping(true)
    }
  }

  findCommand(commandName) {
    return this.commands.get(commandName) || this.aliases.get(commandName)
  }

  async handleMessage(msg, client) {
    if (msg.author.bot) return

    const { Utils, generalConfig } = client
    const { errorMessage, warningMessage, standardMessage, embed } = Utils
    const { content, author, channel, guild } = msg
    const { ownerID } = client.config
    msg.context = this
    const prefix = guild ? await this.handleServer(guild) : this.prefix
    client.p = prefix

    await this.handleConfig()
    await this.handleUser(msg)

    // set db configs
    const generalDB = await generalConfig.findOne({ where: { id: ownerID } })
    client.db.config = JSON.parse(generalDB.dataValues.config)

    // send all messages to our parser
    await MessageManager.logger(msg)

    // if msg doesnt start with prefix then ignore msg
    if (!content.startsWith(prefix) || content.length < 2) return

    // anything after command becomes a list of args
    const args = content.slice(prefix.length).split(' ')

    // command name without prefix
    const commandName = args.shift().toLowerCase()

    // set command name and aliases
    const instance = this.findCommand(commandName)

    // if no command or alias do nothing
    if (!instance) return errorMessage(msg, `No command: ${commandName}`)

    const command = instance
    msg.command = instance.commandName

    // Check if command is enabled
    let disabled = false
    const { disabledCommands } = client.db.config
    disabledCommands.forEach((c) => {
      if (instance.name === c.command || c.aliases.includes(commandName)) disabled = true
    })
    if (disabled) {
      this.Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run disabled command[ ${msg.content.slice(prefix.length)} ]`
      )
      return warningMessage(msg, `Command [ ${commandName} ] is disabled`)
    }

    // if command is marked 'ownerOnly: true' then don't excecute
    if (command.ownerOnly && author.id !== this.ownerID) {
      msg.delete(20000)
      this.Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run owner only command [ ${msg.content.slice(prefix.length)} ]`
      )
      return errorMessage(msg, `This command is owner only nerd`)
    }

    // if command is marked 'guildOnly: true' then don't excecute
    if (command.guildOnly && channel.type === 'dm') {
      this.Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run [ ${msg.content.slice(prefix.length)} ] in a DM`
      )
      return standardMessage(msg, `This command cannot be slid into my DM`)
    }
    // check if user and bot has all required perms in permsNeeded
    if (channel.type !== 'dm') {
      if (command.permsNeeded) {
        const userMissingPerms = this.checkPerms(msg.member, command.permsNeeded)
        const botMissingPerms = this.checkPerms(msg.guild.me, command.permsNeeded)

        if (userMissingPerms) {
          this.Log.info(
            'Command Manager',
            `[ ${author.tag} ] tried to run [ ${msg.content.slice(
              prefix.length
            )} ] but lacks the perms [ ${userMissingPerms.join(', ')} ]`
          )
          const m = await msg.reply(
            embed(msg, 'red')
              .setTitle('You lack the perms')
              .setDescription(`**- ${userMissingPerms.join('\n - ')}**`)
              .setFooter('Message will self destruct in 30 seconds')
          )
          return m.delete(30000)
        }

        if (botMissingPerms) {
          this.Log.info(
            'Command Manager',
            `I lack the perms  [ ${msg.content.slice(
              prefix.length
            )} ] for command [ ${userMissingPerms.join(', ')} ]`
          )
          const m = await channel.send(
            embed(msg, 'red')
              .setTitle('I lack the perms needed to perform that action')
              .setFooter('Message will self destruct in 30 seconds')
              .setDescription(`**- ${botMissingPerms.join('\n - ')}**`)
          )
          return m.delete(30000)
        }
      }
    }

    // if commands is marked 'args: true' run this if no args sent
    if (command.args && !args.length) {
      this.Log.info(
        'Command Manager',
        `[ ${author.tag} ] tried to run [ ${msg.content.slice(prefix.length)} ] without parameters`
      )
      const m = await msg.reply(
        embed(msg, 'yellow')
          .setTitle('Command requires parameters')
          .setFooter('Message will self destruct in 30 seconds')
          .setDescription(
            `**__You can edit your last message instead of sending a new one!__**\n\n**Example Usage**\n\`\`\`css\n${command.usage.join(
              '\n'
            )}\`\`\``
          )
      )
      return m.delete(30000)
    }

    // Run Command
    this.Log.info(
      'Command Manager',
      `[ ${author.tag} ] ran command [ ${msg.content.slice(prefix.length)} ]`
    )
    return this.runCommand(client, command, msg, args)
  }

  async handleConfig() {
    const { generalConfig } = this.client

    const config = await generalConfig.findOne({ where: { id: this.ownerID } })

    if (!config) {
      this.Log.info('Handle Config', `Created new general config for [ ${this.ownerID} ]`)
      await generalConfig.create({
        id: this.ownerID,
        config: JSON.stringify({
          archivebox: { path: null },
          disabledCommands: [],
          docker: { host: null },
          emby: { apiKey: null, host: null, userID: null },
          googleHome: { ip: null, language: null, name: null },
          jackett: { apiKey: null, host: null },
          meraki: { apiKey: null, serielNum: null },
          ombi: { apiKey: null, host: null, username: null },
          pihole: { apiKey: null, host: null },
          pioneerAVR: { host: null },
          rclone: { remote: null },
          routines: [],
          sabnzbd: { apiKey: null, host: null },
          scheduledTasks: {},
          sengled: { jsessionid: null, password: null, username: null },
          shortcuts: [],
          systemPowerControl: [{ host: 'xxx', mac: 'xxx', name: 'xxx' }],
          transmission: { host: null, port: '9091', ssl: false },
          tuyaDevices: [{ id: 'xxxxxxx', key: 'xxx', name: 'xxx' }],
          webUI: { apiKey: null, commands: [] }
        })
      })
    }
  }

  async handleServer(guild) {
    const { id, ownerID, name } = guild
    const { serverConfig } = this.client

    // per server config
    if (!guild) return { prefix: this.prefix }

    let db = await serverConfig.findOne({ where: { id } })

    if (!db) {
      this.Log.info(
        'Handle Server',
        `Creating new server config for guild ID [ ${guild.id} ] [ ${guild.name} ]`
      )
      db = await serverConfig.create({
        serverName: name,
        id,
        ownerID,
        config: JSON.stringify({
          logsChannel: null,
          prefix: this.prefix,
          rules: [],
          starboardChannel: null,
          welcomeChannel: null
        }),
        messages: JSON.stringify({ channels: {}, dm: {}, ignoredChannels: [] })
      })
    }

    const prefix = db.prefix || this.prefix
    return prefix
  }

  async handleUser(msg) {
    const { author } = msg
    const { id, tag: username } = author
    const { memberConfig } = this.client

    const db = await memberConfig.findOne({ where: { id } })

    if (!db) {
      this.Log.info('Handle Server', `Created new member config for user [ ${id} ] [ ${username} ]`)
      await memberConfig.create({ username, id, config: JSON.stringify({ todos: [] }) })
    }
  }

  checkPerms(user, permsNeeded) {
    const missingPerms = []
    permsNeeded.forEach((perm) => {
      if (!user.permissions.has(perm)) missingPerms.push(perm)
    })
    if (missingPerms.length) return missingPerms
  }
}
