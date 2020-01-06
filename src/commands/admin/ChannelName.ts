/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { GuildChannel } from 'discord.js'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Set channel names
 */
export default class ChannelName extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'channelname',
      category: 'Admin',
      description: 'Rename channels',
      usage: ['cname <channelID> <newName>'],
      args: true,
      guildOnly: true,
      permsNeeded: ['MANAGE_CHANNELS']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { standardMessage } = client.Utils

    // * ------------------ Logic --------------------

    const channelName = args.shift()
    const newName = args.join(' ').replace(/ /g, '\u2009')

    const channel = client.channels.get(channelName) as GuildChannel
    channel.setName(newName)
    return standardMessage(msg, `Channel name changed to ${newName}`)
  }
}
