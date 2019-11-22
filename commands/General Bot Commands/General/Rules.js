const Command = require('../../../core/Command')
const Database = require('../../../core/Database')

class Rules extends Command {
  constructor(client) {
    super(client, {
      name: 'rules',
      category: 'General',
      description: 'Behold the rule book.'
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { member, channel } = msg

    if (args[0]) {
      if (!member.permissions.has(['ADMINISTRATOR'])) {
        const m = await channel.send(
          Utils.embed(msg, 'red').setDescription(
            `You must have ['ADMINISTRATOR'] perms to ${args[0]} rules`
          )
        )
        return m.delete(10000)
      }
    }
    const rule = args.slice(1).join(' ')

    const serverConfig = await Database.Models.serverConfig.findOne({
      where: { id: msg.guild.id }
    })
    const { prefix, logsChannel } = serverConfig.dataValues
    const rules = JSON.parse(serverConfig.dataValues.rules)

    const serverLogsChannel = msg.guild.channels.get(logsChannel)

    if (!serverLogsChannel)
      return msg.channel.send(
        Utils.embed(msg, 'yellow').setDescription(
          `It appears that you do not have a logs channel.\nPlease set one with \`${prefix}server set logsChannel <channelID>\``
        )
      )

    switch (args[0]) {
      case 'add': {
        rules.push(rule)
        await serverConfig.update({ rules: JSON.stringify(rules) })
        return msg.reply(Utils.embed(msg, 'green').setDescription(`**${rule}** added to rules`))
      }
      case 'remove': {
        const item = args[1] - 1
        const name = rules[item]
        rules.splice(item, 1)
        await serverConfig.update({ rules: JSON.stringify(rules) })
        if (name) {
          return msg.reply(
            Utils.embed(msg, 'green').setDescription(`**${name}** removed from rules`)
          )
        }
        return msg.reply(
          Utils.embed(msg, 'red').setDescription(`:rotating_light: **Rule does not exist**`)
        )
      }
      default: {
        if (!rules.length) {
          return msg.reply(
            Utils.embed(msg, 'yellow')
              .setTitle(`There are no rules!`)
              .setDescription(`\`${prefix}rules add <rule to add>\`\nTo add some!`)
          )
        }

        let ruleList = ''
        rules.forEach((i, index) => {
          ruleList += `${index + 1} | ${i}\n`
        })
        return msg.reply(
          Utils.embed(msg, 'green')
            .setTitle('Rules')
            .setDescription(ruleList)
        )
      }
    }
  }
}

module.exports = Rules
