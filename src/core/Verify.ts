/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Message } from 'discord.js'
import { NezukoMessage, ServerDBConfig } from 'typings'
import { database } from './database/database'
import { Utils } from './Utils'

/**
 * TODO add into on message events
 */
export class Verify {
  public static async member(msg: NezukoMessage) {
    // If message not sent from guild then ignore
    if (!msg.guild) return
    // If message is sent by bot then ignore
    if (msg.author.bot) return

    // Load server database configs
    const db = await database.models.Servers.findOne({ where: { id: msg.guild.id } })
    const { verifyUsers, verifiedRole, verifyChannel, prefix } = JSON.parse(
      db.get('config') as string
    ) as ServerDBConfig

    // Check if server has enabled the verification of members and
    // Check if message is sent inm the verification channel
    if (verifyUsers && msg.channel.id === verifyChannel) {
      // If no verified role set notify on how to set one
      if (!verifiedRole) {
        return Utils.warningMessage(
          msg,
          `Please set the verified role ID with \`${prefix}server set verifiedRole <role ID>\``
        )
      }

      // If no verified channel set notify on how to set one
      if (!verifyChannel) {
        return Utils.warningMessage(
          msg,
          `Please set the verified channel ID with \`${prefix}server set verifyChannel <channel ID>\``
        )
      }

      //
      if (msg.content === 'agree' && msg.channel.id === verifyChannel) {
        const messageRole = msg.guild.roles.find((role) => role.id === verifiedRole)

        if (messageRole === null) return

        if (!msg.guild.me.hasPermission('MANAGE_ROLES')) {
          const m = (await msg.channel.send(
            'The bot doesn\'t have the permission required to assign roles.\nRequired permission: `MANAGE_ROLES`'
          )) as Message
          return m.delete(20000)
        }

        if (msg.guild.me.highestRole.comparePositionTo(messageRole) < 1) {
          const m = (await msg.channel.send(
            'The position of this role is higher than the bots highest role, it cannot be assigned by the bot.'
          )) as Message
          return m.delete(20000)
        }

        if (messageRole.managed) {
          const m = (await msg.channel.send('This is an auto managed role, it cannot be assigned.')) as Message
          return m.delete(20000)
        }

        if (msg.member.roles.has(messageRole.id)) return

        await msg.react('✅')

        try {
          await msg.member.addRole(messageRole)
          const m = (await msg.reply(`You have been verified. Welcome to ${msg.guild.name}!`)) as Message
          m.delete(10000)
          return msg.delete(10000)
        } catch (e) {
          console.error(e.stack)
          const m = (await msg.channel.send(e.stack)) as Message
          return m.delete(20000)
        }
      }
    }
  }
}
