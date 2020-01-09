/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { NezukoClient } from 'core/NezukoClient'
import { TextChannel } from 'discord.js'
import { GeneralDBConfig, NezukoMessage, ServerDBConfig } from 'typings'
import * as config from '../../config/config.json'
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
  public client: NezukoClient
  public levelUpChannel: TextChannel

  constructor(client: NezukoClient, msg: NezukoMessage) {
    this.msg = msg
    this.author = msg.author
    this.guild = msg.guild
    this.client = client
  }

  /**
   * Handle the User level
   */
  public async manage(): Promise<void> {
    // Only handle XP and levels in Guild Text Channels
    if (this.msg.channel.type === 'text') {
      const serverDB = await this.getDB()
      const serverConfig = JSON.parse(serverDB.get('config') as string) as ServerDBConfig
      const { levelUpChannel } = serverConfig

      if (!('levelUpChannel' in serverConfig)) {
        serverConfig.levelUpChannel = null
        await serverDB.update({ config: JSON.stringify(serverConfig) })
      }

      if (levelUpChannel) {
        this.levelUpChannel = this.client.channels.get(levelUpChannel) as TextChannel
      }

      const db = await database.models.GeneralConfig.findOne({
        where: { id: config.ownerID }
      })
      const { disabledCommands } = JSON.parse(db.get('config') as string) as GeneralDBConfig

      let disabled = false

      disabledCommands.forEach((c) => {
        if ('level' === c.command || c.aliases.includes('levels')) {
          disabled = true
        }
      })

      if (!disabled) {
        await this.handleXP()
        await this.handleRole()
      }
    }
  }

  /**
   * Gets Server Config
   * @returns ServerConfig
   */
  private async getDB() {
    // Fetches and returns the Guilds server config
    return await database.models.ServerConfig.findOne({
      where: { id: this.guild.id }
    })
  }

  /**
   * Gets member level
   * @returns member level
   */
  private async getMemberLevel(): Promise<MemberLevel> {
    // Fetch DB
    const db = await this.getDB()

    // Get the memberLevel Table
    const memberLevels = JSON.parse(db!.get('memberLevels') as string)

    // Assign it to this instance
    this.memberLevels = memberLevels

    // If member doesn't have a level entry then create one
    if (!memberLevels.levels[this.author.id]) {
      memberLevels.levels[this.author.id] = { level: 1, exp: 0, expTillNextLevel: 100 }
    }

    // Return members level information
    return memberLevels.levels[this.author.id] as MemberLevel
  }

  /**
   * Handles general exp leveling for guild
   */
  private async handleXP(): Promise<void> {
    // Fetch guild DB
    const db = await this.getDB()

    // Fetch member level info
    const member = await this.getMemberLevel()

    // Fetch the server config
    const serverConfig = JSON.parse(db!.get('config') as string) as ServerDBConfig

    // If server doesnt have a level multiplier then create and set to 2
    if (!serverConfig.levelMultiplier) {
      serverConfig.levelMultiplier = '2'
      await db.update({ config: JSON.stringify(serverConfig) })
    }

    // Get server's level multiplier
    const { levelMultiplier } = serverConfig

    // Assign the leveling formula base off of the guilds level multiplier
    const levelingFormula = 100 * member.level * Number(levelMultiplier)

    // Standard level up message
    const levelUpMessage = async (level: number) => {
      if (this.levelUpChannel) {
        await this.levelUpChannel.send(this.msg.member.toString())
        await this.levelUpChannel.send(
          Utils.embed().setTitle(`You are now level [ ${level} ] :confetti_ball:`)
        )
      }
    }

    // If member is level 1 and xp is greater than 100 level them up
    if (member.level === 1 && member.exp >= 100) {
      member.level++
      member.exp = 0

      await levelUpMessage(member.level)
    } // Else check if they should level up according to the leveling formula
    else if (member.exp >= levelingFormula) {
      member.level++
      member.exp = 0
      await levelUpMessage(member.level)
    } // Else give EXP point
    else member.exp++

    // Set EXP till next level according to exp and leveling formula
    member.expTillNextLevel = levelingFormula - member.exp

    // Assign member level to instance
    this.level = member.level

    // Update the servers level database
    await db!.update({ memberLevels: JSON.stringify(this.memberLevels) })
  }

  /**
   * Handles assigning roles based on user levels
   */
  private async handleRole() {
    // Fetch guilds config
    const db = await this.getDB()

    // Get servers roles for member levels
    const memberLevels = JSON.parse(db!.get('memberLevels') as string)
    const { levelRoles } = memberLevels

    // Assign member
    const gMember = this.guild.member(this.author)

    // Iterate through all level roles
    for (const levelInfo of levelRoles) {
      const { role, level } = levelInfo

      // If current level is greater than or equal to
      // A role level then give use the role
      if (this.level >= Number(level)) {
        // Check if role exists in guild
        const gRole = this.guild.roles.find((r) => r.name.toLowerCase() === role.toLowerCase())

        // If it does
        if (gRole) {
          // If user doesnt have the role then assign it to them
          if (!gMember.roles.find((r) => r.name === role)) {
            await gMember.addRole(gRole.id)

            if (this.levelUpChannel) {
              await this.levelUpChannel.send(this.msg.member.toString())
              return this.levelUpChannel.send(
                Utils.embed().setTitle(`You've leveled up to the role [ ${role} ] :confetti_ball:`)
              )
            }
          }
        }
      }
    }
  }
}
