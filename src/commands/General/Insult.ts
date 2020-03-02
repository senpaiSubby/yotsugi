/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoClient } from 'core/NezukoClient'
import { NezukoMessage } from 'typings'
import { get } from 'unirest'

import { Command } from '../../core/base/Command'

export default class SpaceText extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'insult',
      category: 'General',
      description: 'Insult that mean bully',
      usage: ['insult @user'],
      args: true,
      cooldown: 10
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[], api: boolean) {
    // * ------------------ Setup --------------------
    const { mentions, guild, author } = msg
    const { standardMessage } = client.Utils

    const user = mentions.members.first() || guild.members.get(args[0]) || guild.members.get(author.id)

    try {
      const response = await get('https://evilinsult.com/generate_insult.php?lang=en&type=json')
      const insult = JSON.parse(response.body)
      return standardMessage(msg, 'green', `Yo <@${user.id}>, ${insult.insult}`)
    } catch {
      // tslint:disable-next-line:quotemark
      return standardMessage(msg, 'green', "Try later I couldn't think of anything right now")
    }
  }
}
