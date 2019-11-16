// Core
const { Client, RichEmbed } = require('discord.js')
const config = require('./data/config')
const shell = require('shelljs')

// clear terminal
shell.exec('clear')

// Initialise
const client = new Client()

client.config = config
client.dateFormat = require('dateformat')
client.logger = require('./core/utils/errorLogger')
client.utils = require('./core/utils/utils')
module.exports = client

// load events
const events = client.utils.findNested('./events', 'js')
events.forEach((f) => require(f))

// login
client.login(config.general.token)
