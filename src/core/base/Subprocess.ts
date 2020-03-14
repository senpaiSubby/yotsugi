/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { BotClient } from '../BotClient'

export class Subprocess {
  public client: BotClient
  public name: string
  public description: string
  public disabled: boolean

  constructor(client: BotClient, data: SubprocessData) {
    this.client = client
    this.name = data.name
    this.description = data.description
    this.disabled = data.disabled || false
  }

  /**
   * Runs subprocess
   */
  public async run() {
    throw new Error('Missing Run Method')
  }
}
