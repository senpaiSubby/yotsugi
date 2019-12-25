/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { NezukoClient } from 'structures/NezukoClient'

export class Subprocess {
  public client: NezukoClient
  public name: string
  public description: string
  public disabled: boolean

  constructor(
    client: NezukoClient,
    data: { name: string; description: string; disabled?: boolean }
  ) {
    if (typeof data !== 'object') throw new Error('Subprocess data parameter must be an object')
    this.client = client
    this.name = data.name
    this.description = data.description
    this.disabled = data.disabled || false

    if (!this.name) throw new Error('Subprocess Name is required')
    if (!this.description) throw new Error('Subprocess Description is required')
    if (typeof this.name !== 'string') throw new TypeError('Subprocess name must be a string')
    if (typeof this.description !== 'string') {
      throw new TypeError('Subprocess description must be a string')
    }
    if (typeof this.disabled !== 'boolean') {
      throw new TypeError('Subprocess disabled property must be a boolean')
    }
  }

  /**
   * Run module
   */
  public run() {
    throw new Error()
  }
}
