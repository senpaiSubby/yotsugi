/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import { TextChannel } from 'discord.js'

export default class SetChannelName extends Command {
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

  /**
   * Run this command
   * @param client Nezuko client
   * @param msg Original message
   * @param args Optional arguments
   */
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { standardMessage } = client.Utils

    // * ------------------ Logic --------------------

    const channel = args.shift()
    const newName = args.join(' ').replace(/ /g, '\u2009')

    const channelToRename = client.channels.get(channel) as TextChannel
    await channelToRename.setName(newName)
    return standardMessage(msg, `Channel name changed to ${newName}`)
  }
}
