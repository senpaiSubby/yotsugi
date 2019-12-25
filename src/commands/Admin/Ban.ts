/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'
import { TextChannel } from 'discord.js'

export default class BanUser extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'ban',
      category: 'Admin',
      description: 'The ban hammer',
      usage: ['ban @user <reason for ban>'],
      guildOnly: true,
      args: true,
      permsNeeded: ['BAN_MEMBERS']
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
    const { warningMessage, standardMessage, embed } = Utils
    const { author, channel, createdAt, guild, mentions } = msg

    // * ------------------ Config --------------------

    const { prefix, LogsChannel } = db!.server

    // * ------------------ Check Config --------------------

    const serverLogsChannel = guild.channels.get(LogsChannel) as TextChannel

    // * ------------------ Logic --------------------

    if (!serverLogsChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a Logs channel.
        Please set one with \`${prefix}server set LogsChannel <channelID>\``
      )
    }
    const target = guild.member(mentions.users.first() || guild.members.get(args[0]))
    const reason = args.slice(1).join(' ')

    if (!target) return warningMessage(msg, `Please specify a member to ban!`)
    if (!reason) return warningMessage(msg, `Please specify a reason for this ban!`)

    const e = embed('red')
      .setThumbnail(target.user.avatarURL)
      .addField('Banned Member', `**${target.user.username}** with an ID: ${target.user.id}`)
      .addField('Banned By', `**${author.username}** with an ID: ${author.id}`)
      .addField('Banned Time', createdAt)
      .addField('Banned At', channel)
      .addField('Banned Reason', reason)
      .setFooter('Banned user information', target.user.displayAvatarURL)

    await target.ban(reason)
    await standardMessage(msg, `${target.user.username} was banned by ${author} for ${reason}`)
    return serverLogsChannel.send(e)
  }
}
