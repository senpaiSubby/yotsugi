/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { TextChannel } from 'discord.js'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/Command'
import { NezukoClient } from '../../NezukoClient'

/**
 * Ban users
 */
export default class Ban extends Command {
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

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { warningMessage, standardMessage, embed } = Utils
    const { author, channel, createdAt, guild, mentions } = msg

    // * ------------------ Config --------------------

    const { prefix, logChannel } = db.server!

    // * ------------------ Check Config --------------------

    // If server doesnt have a log channel set
    // Notify in chat
    if (!logChannel) {
      return warningMessage(
        msg,
        `It appears that you do not have a Loggers channel.
        Please set one with \`${prefix}server set logChannel <channelID>\``
      )
    }

    const serverLogChannel = guild.channels.get(logChannel) as TextChannel

    // * ------------------ Logic --------------------

    // Check if the user mentioned a user to be banned and the reason
    const target = guild.member(mentions.users.first() || guild.members.get(args[0]))
    const reason = args.slice(1).join(' ')

    // If no target user or warning message, notify
    if (!target) return warningMessage(msg, `Please specify a member to ban!`)
    if (!reason) return warningMessage(msg, `Please specify a reason for this ban!`)

    // Setup embed with info on ban
    const e = embed('red')
      .setThumbnail(target.user.avatarURL)
      .addField('Banned Member', `**${target.user.username}** with an ID: ${target.user.id}`)
      .addField('Banned By', `**${author.username}** with an ID: ${author.id}`)
      .addField('Banned Time', createdAt)
      .addField('Banned At', channel)
      .addField('Banned Reason', reason)
      .setFooter('Banned user information', target.user.displayAvatarURL)

    // Ban the target user with the specified reason
    await target.ban(reason)

    // Notify that the user was banned
    await standardMessage(msg, `${target.user.username} was banned by ${author} for ${reason}`)

    // Post the ban embed to the servers log channel
    return serverLogChannel.send(e)
  }
}
