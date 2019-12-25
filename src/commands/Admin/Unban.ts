/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { TextChannel, User } from 'discord.js'

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'

export default class UnbanUser extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'unban',
      category: 'Admin',
      description: 'Unban users',
      usage: ['unban <userID> <reason for unban>'],
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

    const { warningMessage, embed } = client.Utils
    const { db } = client
    const { author, channel, guild } = msg

    // * ------------------ Config --------------------

    const { prefix, LogsChannel } = db!.server

    const serverLogsChannel = msg.guild.channels.get(LogsChannel) as TextChannel

    // * ------------------ Check Config --------------------

    if (!serverLogsChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a Logs channel.
        Please set one with \`${prefix}server set LogsChannel <channelID>\``
      )
    }

    // * ------------------ Logic --------------------

    let target: User
    const bans = await msg.guild.fetchBans()
    bans.forEach((user) => {
      if (user.id === args[0]) target = user
    })

    const reason = args.slice(1).join(' ')

    if (!target) return warningMessage(msg, `Please specify a member to unban!`)
    if (!reason) return warningMessage(msg, `Please specify a reason for this unban!`)
    await guild.unban(target, reason)

    return serverLogsChannel.send(
      embed('green')
        .addField('Unbanned Member', `**${target.username}** with an ID: ${target.id}`)
        .addField('Unbanned By', `**${author.username}** with an ID: ${author.id}`)
        .addField('Unbanned Time', msg.createdAt)
        .addField('Unbanned At', channel)
        .addField('Unbanned Reason', reason)
    )
  }
}
