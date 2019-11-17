// Core
const { Client, RichEmbed } = require('discord.js')
const chalk = require('chalk')
const shell = require('shelljs')
const config = require('./data/config')
const CommandManager = require('./core/CommandManager')
const SubprocessManager = require('./core/SubprocessManager')
// clear terminal
shell.exec('clear')

// Initialise
const client = new Client()

client.config = config
client.dateFormat = require('dateformat')
client.logger = require('./core/utils/errorLogger')
client.utils = require('./core/utils/utils')

const Manager = new CommandManager(client)

Manager.loadCommands('./commands')

module.exports = { client, Manager }

const Subprocesses = new SubprocessManager(client)

// handle events
client.once('ready', async () => {
  const { prefix } = client.config.general
  client.logger.info(chalk.green(`${chalk.yellow(client.user.username)}'s lazers ready to fire.`))
  client.user.setActivity(`${prefix}help`)
  Subprocesses.loadModules('./core/subprocesses/')
})

client.on('guildMemberAdd', (member) => {
  const { prefix } = client.config.general
  const embed = new RichEmbed()
  embed.setColor(3447003)
  embed.setThumbnail(member.guild.iconURL)
  embed.setAuthor(member.user.username, member.user.avatarURL)
  embed.setTitle(`Welcome To ${member.guild.name}!`)
  embed.setDescription(
    `Please take a look at our rules by typing **${prefix}rules**!\nView our commands with **${prefix}help**\nEnjoy your stay!`
  )
  const channel = member.guild.channels.get(client.config.general.welcomeChannel)
  return channel.send({ embed })
})

client.on('message', (message) => Manager.handleMessage(message, client))
client.on('messageUpdate', (old, _new) => {
  if (old.content !== _new.content) Manager.handleMessage(_new, client)
})

// login
client.login(config.general.token)
