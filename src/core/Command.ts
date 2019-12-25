/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { NezukoClient } from '../structures/NezukoClient'

interface NezukoCommandData {
  name: string
  category: string
  description: string
  aliases?: string[]
  args?: boolean
  webUI?: boolean
  usage?: string[]
  guildOnly?: boolean
  ownerOnly?: boolean
  permsNeeded?: string[]
  disabled?: boolean
}

export class Command {
  public client: NezukoClient
  public name: string = ''
  public category: string = ''
  public description: string = ''
  public aliases: string[] = []
  public args: boolean = false
  public webUI: boolean = false
  public usage: string[] = []
  public guildOnly: boolean = false
  public ownerOnly: boolean = false
  public permsNeeded: string[] = []
  public disabled: boolean = false

  constructor(client: NezukoClient, data: NezukoCommandData) {
    if (typeof data !== 'object') throw new TypeError('Client data parameter must be an object')
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

    if (!this.name) throw new Error('Command Name is required')
    if (!this.description) throw new Error('Command Description is required')
    if (typeof this.name !== 'string') throw new TypeError('Command name must be a string')
    if (typeof this.description !== 'string') {
      throw new TypeError('Command description must be a string')
    }
    if (typeof this.category !== 'string') throw new TypeError('Command category must be a string')
    if (!(this.permsNeeded instanceof Array)) {
      throw new TypeError('Command permsNeeded must be an array of strings')
    }
    if (this.permsNeeded.some((perm) => typeof perm !== 'string')) {
      throw new TypeError('Command permsNeeded must be an array of strings')
    }
    if (!(this.aliases instanceof Array)) {
      throw new TypeError('Command aliases must be an array of strings')
    }
    if (this.aliases.some((alias) => typeof alias !== 'string')) {
      throw new TypeError('Command aliases must be an array of strings')
    }
    if (this.usage.some((usage) => typeof usage !== 'string')) {
      throw new TypeError('Command usage must be an array of strings')
    }
    if (typeof this.guildOnly !== 'boolean') {
      throw new TypeError('Command guildOnly property must be a boolean')
    }
    if (typeof this.args !== 'boolean') {
      throw new TypeError('Command args property must be a boolean')
    }
    if (typeof this.webUI !== 'boolean') {
      throw new TypeError('Command webUI property must be a boolean')
    }
    if (typeof this.ownerOnly !== 'boolean') {
      throw new TypeError('Command ownerOnly property must be a boolean')
    }
  }
}
