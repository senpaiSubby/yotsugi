/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import database from '../../core/database'
import { NezukoClient } from '../../core/NezukoClient'

export default class Level extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'level',
      category: 'General',
      description: 'Check yourself and others guild levels',
      aliases: ['levels'],
      usage: [
        'level <user>',
        'level add <level> <role>',
        'level remove <level> <role>',
        'level change <level> <role>',
        'level list'
      ]
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, standardMessage, embed } = client.Utils
    const { guild, mentions, author, channel } = msg

    // * ------------------ Config --------------------

    const db = await database.models.ServerConfig.findOne({
      where: { id: guild.id }
    })

    const memberLevels = JSON.parse(db.get('memberLevels') as string)
    const { levels, levelRoles } = memberLevels

    const user = mentions.members.first() || guild.member(author)

    if (!levels[user.user.id]) levels[user.user.id] = { level: 0, exp: 0, expTillNextLevel: 0 }

    const member = levels[user.user.id]

    // * ------------------ Logic --------------------

    // Just checks if the user has the MANAGE_ROLE permission
    const checkRole = async () => {
      if (user.permissions.has('MANAGE_ROLES')) return true

      await warningMessage(msg, `You must have the [ MANAGE_ROLES ] perm to use this option`)
      return false
    }

    switch (args[0]) {
      case 'add': {
        if (await checkRole()) {
          const level = args[1]
          const role = args[2]

          // Check if user specified the role and level to add
          if (!guild.roles.find((r) => r.name.toLowerCase() === role.toLowerCase())) {
            return warningMessage(msg, `Role [ ${role} ] doesn't exist`)
          }
          if (!role) return warningMessage(msg, `You must provide a role`)
          if (!level) return warningMessage(msg, `You must provide a level`)

          // Get index of role level in config
          let index = levelRoles.findIndex((i: MemberLevel) => i.level === level)

          // If level role doesnt exit then add it in
          if (index === -1) {
            levelRoles.push({ level, role })
            index = levelRoles.findIndex((i: MemberLevel) => i.level === level)
          }

          // Else if it exists already notify user
          else if (levelRoles[index].role === role) {
            return warningMessage(msg, `Role [ ${role} ] is already assigned to level [ ${level} ]`)
          }

          // Save changes
          levelRoles[index] = { level, role }
          await db.update({ memberLevels: JSON.stringify(memberLevels) })

          return standardMessage(msg, `Added role [ ${role} ] to level [ ${level} ]`)
        }
        return
      }
      case 'remove': {
        if (await checkRole()) {
          const level = args[1]
          const role = args[2]

          // Check if user specified the role and level to add
          if (!role) return warningMessage(msg, `You must provide a role`)
          if (!level) return warningMessage(msg, `You must provide a level`)

          // Get index of role level in config
          const index = levelRoles.findIndex((i: MemberLevel) => i.level === level)

          // Check if the role is assigned to a level
          if (index === -1) {
            return warningMessage(msg, `The role [ ${role} ] isn't assigned to level [ ${level} ]`)
          }

          // If it is then remove it
          if (levelRoles[index].role === role) levelRoles.splice(index)

          // Save changes
          await db.update({ memberLevels: JSON.stringify(memberLevels) })

          return standardMessage(msg, `Removed role [ ${role} ] from level [ ${level} ]`)
        }
        return
      }
      case 'change': {
        if (await checkRole()) {
          const level = args[1]
          const role = args[2]

          // Check if user specified the role and level to add
          if (!role) return warningMessage(msg, `You must provide a role`)
          if (!level) return warningMessage(msg, `You must provide a level`)

          // Get index of role level in config
          const index = levelRoles.findIndex((i: MemberLevel) => i.level === level)

          // Check if the role is assigned to a level
          if (index === -1) {
            return warningMessage(msg, `The role [ ${role} ] isn't assigned to level [ ${level} ]`)
          }
          // If it is then change it
          levelRoles[index] = { level, role }

          // Save changes
          await db.update({ memberLevels: JSON.stringify(memberLevels) })

          return standardMessage(msg, `Changed level [ ${level} ] role to [ ${role} ]`)
        }
        return
      }
      case 'list': {
        if (levelRoles.length) {
          const e = embed('green', 'question.png')
            .setTitle('Level Roles')
            .setDescription(
              'Here are the roles you will be assigned according to your level. Chat often if you want to level up!'
            )

          for (const roleLevel of levelRoles) {
            const { level, role } = roleLevel
            e.addField(`Level [ ${level} ] `, `**[ ${role} ]**`, true)
          }

          return channel.send(e)
        }

        return standardMessage(msg, `There are no roles assigned to any levels right now`)
      }
      default: {
        const e = embed()
          .setTitle(`${user.user.username}'s Guild Level`)
          .addField('🎚️ Level', member.level, true)
          .addField('⚔️ EXP', member.exp, true)
          .addField('➡️ Next Level', member.expTillNextLevel, true)
          .setThumbnail(user.user.avatarURL)

        return channel.send(e)
      }
    }
  }
}
