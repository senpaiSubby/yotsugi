const { client } = require('../subbyBot')
const Discord = require('discord.js')
const messageLogging = require('../lib/messageLogging')
const chalk = require('chalk')
const moment = require('moment')

client.on('message', async (msg) => {
  // client.emit('guildMemberAdd', msg.member)
  const time = moment().format('LT')
  const { logger } = client

  //* load config
  const { prefix, ownerId } = client.config.general
  //* init collection to hold command cooldown checks
  const cooldowns = new Discord.Collection()
  //* assign some variables for convience

  const content = msg.content

  //* if msg is sent by bot then ignore
  if (msg.author.bot) return

  //* send all messages to our logger
  await messageLogging(client, msg)

  //* if msg doesnt start with prefix then ignore msg
  if (!content.startsWith(prefix)) return

  //* anything after command becomes a list of args
  const args = content.slice(prefix.length).split(/ +/)

  //* command name without prefix
  const commandName = args.shift().toLowerCase()

  //* set command name and aliases
  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.help.aliases && cmd.help.aliases.includes(commandName))

  //* if no command or alias do nothing
  if (!command) return

  //* Check if command is enabled
  if (!command.options.enabled) return

  //* print to console hwne user runs any command
  logger.info(
    chalk.green(
      `${chalk.yellow(msg.author.tag)} ran command ${chalk.yellow(commandName)} ${chalk.yellow(
        args.join(' ')
      )}`
    )
  )

  //* if command is marked 'ownerOnly: true' then don't excecute
  if (command.options.ownerOnly && msg.author.id !== ownerId) {
    return msg
      .reply({
        embed: {
          title: 'Only my master can use that command you fucking weaboo warrior'
        }
      })
      .then((msg) => {
        msg.delete(10000)
      })
  }

  //* if command is marked 'guildOnly: true' then don't excecute
  if (command.options.guildOnly && msg.channel.type === 'dm' && msg.author.id !== ownerId) {
    return msg.reply({ embed: { title: 'I refuse to do that for you here.' } })
  }

  //* if commands is marked 'args: true' run this if no args sent
  if (command.options.args && !args.length) {
    return msg
      .reply({
        embed: {
          title: "You didn't provide any arguments",
          fields: [
            {
              name: '**Example Usage**',
              value: '```css' + `\n${command.help.usage.replace(' | ', '\n')}` + '```'
            }
          ]
        }
      })
      .then((msg) => {
        msg.delete(10000)
      })
  }

  //* check if command is on cooldown
  if (!cooldowns.has(command.help.name)) {
    cooldowns.set(command.help.name, new Discord.Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command.help.name)
  const cooldownAmount = (command.options.cooldown || 3) * 1000

  if (timestamps.has(msg.author.id && msg.author.id !== ownerId)) {
    const expirationTime = timestamps.get(msg.author.id) + cooldownAmount

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000
      msg.delete()
      return msg
        .reply(
          `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${
            command.name
          }\` command.`
        )
        .then((msg) => msg.delete(2000))
    }
  } else {
    timestamps.set(msg.author.id, now)
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount)
  }

  //* continue to command execution
  try {
    msg.channel.startTyping()
    command.execute(client, msg, args, null)
    msg.channel.stopTyping()
  } catch (error) {
    logger.warn(error)
    msg.reply('there was an error trying to execute that command!')
  }
})
