/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { PermissionResolvable } from 'discord.js'
import { CommandData } from 'typings/Command'

import { BotClient } from '../BotClient'

export class Command {
  public client: BotClient
  public name: string
  public category: string
  public description: string
  public aliases: string[]
  public args: boolean
  public webUI: boolean
  public usage: string[]
  public guildOnly: boolean
  public ownerOnly: boolean
  public permsNeeded: PermissionResolvable[]
  public disabled: boolean
  public cooldown: number

  constructor(client: BotClient, data: CommandData) {
    this.client = client
    this.name = data.name
    this.category = data.category || ''
    this.description = data.description
    this.aliases = data.aliases || []
    this.args = data.args || false
    this.webUI = data.webUI || false
    this.usage = data.usage || []
    this.guildOnly = data.guildOnly || false
    this.ownerOnly = data.ownerOnly || false
    this.permsNeeded = data.permsNeeded || []
    this.cooldown = data.cooldown || 0
    this.disabled = data.disabled || false
  }
}
