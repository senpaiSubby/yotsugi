/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { utc } from 'moment'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

export default class GuildInfo extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'guild',
      category: 'Information',
      description: 'Show guild info',
      guildOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage) {
    // * ------------------ Setup --------------------

    const { embed } = client.Utils
    const { guild, channel } = msg

    // * ------------------ Logic --------------------

    const e = embed()
      .setTitle(`${guild.name}`)
      .addField('👑 Owner', guild.owner.user.tag, true)
      .addField('🗺️ Region', guild.region.toUpperCase(), true)
      .addField('🎌 Founded', utc(guild.createdAt).format('MMMM DD YY'), true)
      .addField(
        '📜 Roles',
        guild.roles
          .map((role) => {
            if (role.name !== '@everyone') return role.name
          })
          .sort()
          .join(' | ')
      )
      .setThumbnail(guild.iconURL)

    return channel.send(e)
  }
}
