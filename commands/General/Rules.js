const Command = require('../../../noelleBot/core/Command')
const Database = require('../../../noelleBot/core/Database')

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
    const { warningMessage, standardMessage } = Utils
    const { member } = msg

    if (args[0]) {
      if (!member.permissions.has(['ADMINISTRATOR'])) {
        return warningMessage(msg, `You must have ['ADMINISTRATOR'] perms to ${args[0]} rules`)
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
      return warningMessage(
        msg,
        `It appears that you do not have a logs channel.\nPlease set one with \`${prefix}server set logsChannel <channelID>\``
      )

    switch (args[0]) {
      case 'add': {
        rules.push(rule)
        await serverConfig.update({ rules: JSON.stringify(rules) })
        return standardMessage(msg, `${rule}\n\nAdded to rules`)
      }
      case 'remove': {
        const item = args[1] - 1
        const name = rules[item]
        rules.splice(item, 1)
        await serverConfig.update({ rules: JSON.stringify(rules) })
        if (name) {
          return standardMessage(msg, `${name}\n\nRemoved from rules`)
        }
        return warningMessage(msg, `Rule does not exist`)
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
