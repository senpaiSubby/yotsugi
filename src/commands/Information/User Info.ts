/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import dateFormat from 'dateformat'
import { utc } from 'moment'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class UserInfo extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'user',
      category: 'Information',
      description: 'Get info on yourself and others',
      usage: [`userinfo`, `userinfo @user`],
      guildOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, embed } = client.Utils
    const { member, channel } = msg

    // * ------------------ Logic --------------------

    const user = args[0] ? msg.mentions.members.first() : member
    if (!user) return warningMessage(msg, `Did not find a user with that query`)

    const inGuild = msg.guild.members.has(user.id)
    const roles = user.roles.map((role) => role.name)

    const e = embed('green')
      .setTitle(`${user.user.tag}'s User Info`)
      .setThumbnail(user.user.avatarURL)
      .addField('ID:', `${user.id}`, true)
      .addField('Nickname:', `${user.nickname !== null ? `${user.nickname}` : 'None'}`, true)
      .addField('Status:', `${user.presence.status}`, true)
      .addField('In Server', user.guild.name, true)
      .addField('Bot:', `${user.user.bot ? 'True' : 'False'}`, true)
      .addField('Joined', `${utc(user.joinedAt).format('MMMM DD YY')}`, true)
      .addField('Roles', `- ${roles.join('\n- ')}`, true)

    if (inGuild) {
      const rMember = msg.guild.members.get(user.user.id)

      const memSort = msg.guild.members.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).array()
      let position = 0

      for (const guildember of memSort) {
        position++
        if (guildember.id === user.id) break
      }

      e.addField('Joined At', dateFormat(rMember.joinedAt), true).addField('Joined Position', position, true)
    }

    return channel.send(e)
  }
}
