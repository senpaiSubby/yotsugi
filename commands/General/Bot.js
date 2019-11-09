const Discord = require('discord.js')
const config = require('../../data/config')
const { prefix } = config.general

module.exports = {
  help: {
    name: 'bot',
    category: 'Moderation',
    description: 'Performs bot related functions.',
    usage: `${prefix}bot logout | ${prefix}bot restart | ${prefix}bot uptime`,
    aliases: ['']
  },
  options: {
    enabled: true,
    apiEnabled: false,
    showInHelp: false,
    ownerOnly: true,
    guildOnly: true,
    args: true,
    cooldown: 5
  },
  async execute (client, msg, args, api) {
    // remove original msg
    if (!api) msg.delete()

    if (!api) {
      const embed = new Discord.RichEmbed().setFooter(`Requested by: ${msg.author.username}`)

      switch (args[0]) {
        case 'logout': {
          embed.setTitle('Logging out..')
          const message = await msg.channel.send({ embed })
          await message.delete(5000)
          return client.destroy()
        }

        case 'restart': {
          embed.setTitle('Restarting..')
          const message = await msg.channel.send({ embed })
          await message.delete(5000)
          process.exit()
        }

        case 'uptime': {
          const upTime = client.utils.millisecondsToTime(client.uptime)
          embed.setTitle(`Up for ${upTime}`)
          const message = await msg.channel.send({ embed })
          return message.delete(10000)
        }
      }
    }
  }
}
