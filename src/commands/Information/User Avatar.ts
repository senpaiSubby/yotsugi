/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class UserAvatar extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'avatar',
      category: 'Information',
      description: 'Show the avatar of users',
      usage: [`avatar`, `avatar @user`],
      guildOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage) {
    // * ------------------ Setup --------------------

    const { embed, warningMessage } = client.Utils
    const { author, channel } = msg

    // * ------------------ Logic --------------------

    const member = msg.mentions.members.first() || msg.guild.member(author)

    if (!member.user.avatar) return warningMessage(msg, "This user doesn't have an avatar!")
    const avatar = member.user.avatarURL

    return channel.send(
      embed('green')
        .setAuthor(`${member.user.tag}`, avatar)
        .setDescription(`[Avatar URL](${avatar})`)
        .setImage(avatar)
    )
  }
}
