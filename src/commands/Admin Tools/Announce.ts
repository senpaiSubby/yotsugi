/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { TextChannel } from 'discord.js'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Announce messages to the server
 */
export default class Announce extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'announce',
      category: 'Admin Tools',
      description: 'Send a message to your announcement channel',
      usage: ['announce <hey guys GIVEAWAY!>'],
      guildOnly: true,
      args: true,
      permsNeeded: ['MANAGE_GUILD'],
      cooldown: 20
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { warningMessage, embed } = Utils
    const { author, guild } = msg

    // * ------------------ Config --------------------

    // Get server prefix and announcementChannel from database
    const { prefix, announcementChannel } = db.server!

    // * ------------------ Logic --------------------

    // If the announcement channel doesnt exists in server or isnt set
    // Notify in chat to set the channel
    if (!announcementChannel) {
      return warningMessage(
        msg,
        `It appears that you don't have an announcement channel set.
        \`${prefix}server set announcementChannel <channelID>\` to set one`
      )
    }

    const serverAnnouncementChannel = guild.channels.get(announcementChannel) as TextChannel

    // Grab everyone from the guidls default role
    const everyone = msg.guild.defaultRole

    // Ping all users
    await serverAnnouncementChannel.send(everyone.toString())

    // Post announcement to channel
    return serverAnnouncementChannel.send(
      embed(msg, 'blue', 'news.png')
        .setTitle('ANNOUNCEMENT!')
        .setDescription(`**${args.join(' ')}**`)
        .setTimestamp(new Date())
        .setFooter(`From ${author.tag}`, author.avatarURL)
    )
  }
}
