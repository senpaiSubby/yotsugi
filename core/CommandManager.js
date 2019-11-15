const fs = require('fs')
const path = require('path')
const config = require('./config')
const { Collection, RichEmbed, Client } = require('discord.js')

module.exports = class CommandManager {
  constructor(client) {
    this.client = client
    this.commands = new Collection()
    this.aliases = new Collection()

    if (!this.client || !(this.client instanceof Client)) {
      throw new Error('Discord Client is required')
    }
  }

  loadCommands(directory) {
    const cmdFiles = this.client.utils.findNested(directory, '.js')
    cmdFiles.forEach((file) => {
      this.startModule(file)
    })
  }

  startModule(location) {
    const Command = require(location)
    const instance = new Command(this.client)
    const commandName = instance.name.toLowerCase()
    instance.location = location

    if (instance.disabled) return
    if (this.commands.has(commandName)) {
      ////Logger.error('Start Module', `"${commandName}" already exists!`)
      throw new Error('Commands cannot have the same name')
    }

    this.commands.set(commandName, instance)

    for (const alias of instance.aliases) {
      if (this.aliases.has(alias)) {
        throw new Error(`Commands cannot share aliases: ${instance.name} has ${alias}`)
      } else {
        this.aliases.set(alias, instance)
      }
    }
  }

  runCommand(command, message, args, api = false) {
    try {
      //Logger.warn('Command Parser', `Matched ${command.name}, Running...`)
      return command.run(this.client, message, args, api)
    } catch (err) {
      return //error('Command', err)
    }
  }

  findCommand(commandName) {
    const command = this.commands.get(commandName) || this.aliases.get(commandName)
    return { command, commandName }
  }

  async handleMessage(message) {
    // Don't Parse Bot Messages
    if (message.author.bot) return false

    // Handle Server Configuration
    const { prefix } = '?'
    const args = []

    // Run Command
    const instance = this.findCommand(message.content)
    const command = instance.command
    return this.runCommand(command, message, args)
    console.log(command)
  }

  getAdministrators(guild) {
    let owners = ''

    for (const member of guild.members.values()) {
      if (member.hasPermission('ADMINISTRATOR')) {
        owners = owners === '' ? member.user.id : `${owners},${member.user.id}`
      }
    }

    return owners
  }
}
