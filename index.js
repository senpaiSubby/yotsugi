// Core
const { Client, RichEmbed } = require('discord.js')
const config = require('./data/config')
const CommandManager = require('./core/CommandManager')
const SubprocessManager = require('./core/SubprocessManager')
const shell = require('shelljs')
const chalk = require('chalk')

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
const Subprocesses = new SubprocessManager(client)

// Handle Discord
const { prefix } = config.general
const onReady = () => {
  const { username } = client.config.general
  // log that bot is ready
  client.logger.info(chalk.green(`${chalk.yellow(client.user.username)}'s lazers ready to fire.`))

  // set bot username
  if (client.user.username !== username) {
    client.user.setUsername(username)
    client.logger.info(chalk.white(`Username changed to ${chalk.yellow(username)}`))
  }

  // set bot activity status
  client.user.setActivity(`${prefix}help`, {
    type: 'LISTENING'
  })
  Subprocesses.loadModules('./core/subprocesses/')
}

client.login(config.general.token)
client.once('ready', onReady)
client.on('message', (message) => Manager.handleMessage(message))
client.on('messageUpdate', (old, _new) => {
  if (old.content !== _new.content) Manager.handleMessage(_new)
})
client.on('guildMemberAdd', (member) => {
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

module.exports = { client, Manager }
