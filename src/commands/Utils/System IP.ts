/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import fetch from 'node-fetch'
import { NezukoMessage } from 'typings'
import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'

/**
 * Command to get the public IP of the server the bot is hosted on
 */
export default class SystemIP extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: false,
      category: 'Utils',
      description: 'Get the server IP',
      name: 'ip',
      ownerOnly: true,
      usage: [`ip`],
      webUI: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { standardMessage, errorMessage } = Utils

    interface IFConfig {
      ip: string
      ip_decimal: number
      country: string
      country_eu: boolean
      country_iso: string
      city: string
      hostname: string
      latitude: number
      longitude: number
      asn: string
      asn_org: string
    }

    try {
      // Fetch public IP from ifconfig.co

      const response = await fetch('https://ifconfig.co/json', { headers: { accept: 'application/json' } })

      // Parse json body from response
      const data = (await response.json()) as IFConfig

      // Return public IP
      return standardMessage(msg, 'green', `My public IP is ${data.ip}`)
    } catch {
      // On error notify user
      return errorMessage(msg, 'Failed to fetch public IP')
    }
  }
}
