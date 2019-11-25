const moment = require('moment')
const Command = require('../../core/Command')

class UserInfo extends Command {
  constructor(client) {
    super(client, {
      name: 'userinfo',
      category: 'Fun',
      description: 'Get info on yourself and others.',
      usage: `userinfo | userinfo @user`,
      aliases: ['user'],
      guildOnly: true
    })
  }

  async run(client, msg, args) {
    const { Utils } = client
    const { warningMessage } = Utils
    const { member, channel } = msg

    const user = args[0] ? msg.mentions.members.first() : member
    console.log(user)
    if (!user) {
      return warningMessage(msg, `Did not find a user with that query`)
    }

    const inGuild = msg.guild.members.has(user.id)
    const roles = user.roles.map((role) => role.name)

    const embed = Utils.embed(msg, 'green')
      .setTitle(`${user.user.tag}'s User Info`)
      .setThumbnail(user.user.avatarURL)
      .addField('ID:', `${user.id}`, true)
      .addField('Nickname:', `${user.nickname !== null ? `${user.nickname}` : 'None'}`, true)
      .addField('Status:', `${user.presence.status}`, true)
      .addField('In Server', user.guild.name, true)
      .addField('Bot:', `${user.user.bot ? 'True' : 'False'}`, true)
      .addField('Joined', `${moment.utc(user.joinedAt).format('MMMM DD YY')}`, true)
      .addField('Roles', `- ${roles.join('\n- ')}`, true)

    if (inGuild) {
      const member = msg.guild.members.get(user.user.id)

      const memSort = msg.guild.members
        .sort((a, b) => {
          return a.joinedTimestamp - b.joinedTimestamp
        })
        .array()
      let position = 0

      for (let i = 0; i < memSort.length; i++) {
        position++
        if (memSort[i].id === user.id) break
      }

      embed
        .addField('Joined At', client.dateFormat(member.joinedAt), true)
        .addField('Joined Position', position, true)
    }

    if (user.user.presence.activity) embed.addField('Game', user.user.presence.activity.name)

    return channel.send(embed)
  }
}
module.exports = UserInfo
