/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoMessage } from 'typings'
import database from '../database'
import { Utils } from '../utils/Utils'

/**
 * Level manager
 * Handles keeping track of user levelign and assigning roles based on levels
 */
export class LevelManager {
  public msg: NezukoMessage
  public author: import('discord.js').User
  public guild: import('discord.js').Guild
  public memberLevels: any
  public level: number | undefined

  constructor(msg: NezukoMessage) {
    this.msg = msg
    this.author = msg.author
    this.guild = msg.guild
  }

  /**
   * Handle the User level
   */
  public async manage(): Promise<void> {
    if (this.msg.channel.type === 'text') {
      await this.handleXP()
      await this.handleRole()
    }
  }

  /**
   * Gets Server Config
   * @returns ServerConfig
   */
  private async getDB() {
    return await database.models.ServerConfig.findOne({
      where: { id: this.guild.id }
    })
  }

  /**
   * Gets member level
   * @returns member level
   */
  private async getMemberLevel(): Promise<MemberLevel> {
    const db = await this.getDB()

    const memberLevels = JSON.parse(db!.get('memberLevels') as string)

    this.memberLevels = memberLevels

    if (!memberLevels.levels[this.author.id]) {
      memberLevels.levels[this.author.id] = { level: 1, exp: 0, expTillNextLevel: 100 }
    }

    return memberLevels.levels[this.author.id] as MemberLevel
  }

  /**
   * Handles general exp leveling for guild
   */
  private async handleXP(): Promise<void> {
    const db = await this.getDB()
    const member = await this.getMemberLevel()

    const levelUpMessage = (level: number) =>
      Utils.standardMessage(this.msg, `You are now level [ ${level} ] :confetti_ball:`)

    if (member.level === 1 && member.exp >= 100) {
      member.level++
      member.exp = 0

      await levelUpMessage(member.level)
    } else if (member.exp >= 100 * member.level * 2) {
      member.level++
      member.exp = 0
      await levelUpMessage(member.level)
    } else {
      member.exp++
    }

    member.expTillNextLevel = 100 * member.level * 2 - member.exp

    this.level = member.level
    await db!.update({ memberLevels: JSON.stringify(this.memberLevels) })
  }

  /**
   * Handles assigning roles based on user levels
   */
  private async handleRole() {
    const db = await database.models.ServerConfig.findOne({
      where: { id: this.guild.id }
    })

    const memberLevels = JSON.parse(db!.get('memberLevels') as string)
    const { levelRoles } = memberLevels

    const gMember = this.guild.member(this.author)

    for (const levelInfo of levelRoles) {
      const { role, level } = levelInfo

      if (this.level === Number(level)) {
        const gRole = this.guild.roles.find((r) => r.name.toLowerCase() === role.toLowerCase())

        if (gRole) {
          if (this.guild.roles.has(gRole.id)) {
            if (!gMember.roles.find((r) => r.name === role)) {
              await gMember.addRole(gRole.id)
              await Utils.standardMessage(this.msg, `You've been upgraded to the role [ ${role} ]`)
            }
          }
        }
      }
    }
  }
}
