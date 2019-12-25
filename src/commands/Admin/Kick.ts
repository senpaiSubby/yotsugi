/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import { TextChannel } from 'discord.js'

export default class KickUsers extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'kick',
      category: 'Admin',
      description: 'Kick em out',
      usage: [`kick <@username>`],
      guildOnly: true,
      args: true,
      permsNeeded: ['KICK_MEMBERS']
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

    const { Utils, db } = client
    const { warningMessage, embed } = Utils
    const { author, channel, guild, mentions, createdAt } = msg

    // * ------------------ Config --------------------

    const { prefix, LogsChannel } = db!.server

    const serverLogsChannel = guild.channels.get(LogsChannel) as TextChannel

    // * ------------------ Check Config --------------------

    if (!serverLogsChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a Logs channel.
        Please set one with \`${prefix}server set LogsChannel <channelID>\``
      )
    }

    // * ------------------ Logic --------------------

    if (msg.mentions.members.size === 0) {
      return warningMessage(msg, `Please mention a user to kick`)
    }

    const kickMember = mentions.members.first()

    if (!args[1]) return warningMessage(msg, `Please put a reason for the kick`)

    const target = await kickMember.kick(args.join(' '))

    const reason = args.slice(1).join(' ')
    return serverLogsChannel.send(
      embed('yellow')
        .setThumbnail(target.user.avatarURL)
        .addField('Kicked Member', `**${target.user.username}** with an ID: ${target.user.id}`)
        .addField('Kicked By', `**${author.username}** with an ID: ${author.id}`)
        .addField('Kicked Time', createdAt)
        .addField('Kicked At', channel)
        .addField('Kicked Reason', reason)
        .setFooter('Kicked user information', target.user.displayAvatarURL)
    )
  }
}
