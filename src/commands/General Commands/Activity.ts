/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoClient } from 'core/NezukoClient'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'

export default class Activity extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'activity',
      category: 'General Commands',
      description: 'Template',
      usage: [],
      aliases: [],
      guildOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api: boolean) {
    // * ------------------ Setup --------------------
    const { Utils } = client
    const { embed, paginate, sortByKey } = Utils
    const { author, channel, guild } = msg
    // * ------------------ Config --------------------
    const db = await database.models.Servers.findOne({ where: { id: guild.id } })
    const config = JSON.parse(db.get('userActivity') as string) as any[]
    const sorted = Object.keys(config)
      .sort((a, b) => config[b].score - config[a].score)
      .map((cat) => config[cat])

    const e = embed(msg).setTitle('User Activity')

    sorted.forEach((user, index) => {
      const { active, inactive, score, userID } = user
      const member = guild.members.get(userID)
      if (index > 24) return
      if (member) e.addField(`**${member.user.username}**`, `Score: ${score}`)
    })

    return channel.send(e)

    // * ------------------ Check Config --------------------

    // * ------------------ Logic --------------------
    // * ------------------ Usage Logic --------------------
  }
}
