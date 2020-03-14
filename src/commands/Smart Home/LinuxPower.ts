/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'
import { post } from 'unirest'
import wol from 'wol'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

/**
 * Command to change power state of linux servers
 */
export default class LinuxPower extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Smart Home',
      description: 'Manage power state of linux computers',
      name: 'pc',
      ownerOnly: true,
      usage: [`system gaara off`, `pc thinkboi reboot`],
      webUI: true
    })
  }

  // TODO add linuxpower typings
  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { errorMessage, validOptions, standardMessage, embed, capitalize } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const devices = config.systemPowerControl

    // * ------------------ Logic --------------------

    const sendCommand = async (
      device: { host: string; mac: string; name: string },
      command: 'off' | 'on' | 'reboot'
    ) => {
      const { host, mac, name } = device

      switch (command) {
        case 'reboot':
        case 'off': {
          try {
            const response = await post(host)
              .headers({ 'Content-Type': 'application/json' })
              .send({ command })

            const statusCode = response.status

            if (statusCode === 200) {
              const text = command === 'reboot' ? 'reboot' : 'power off'
              return standardMessage(msg, 'green', `:desktop: Told [ ${capitalize(name)} ] to [ ${text}] `)
            }
          } catch (e) {
            Log.error('System Power Control', `Failed to connect to [ ${capitalize(name)} ]`, e)
            await errorMessage(msg, `Failed to connect to [ ${capitalize(name)} ]`)
          }
          return
        }
        case 'on': {
          await wol.wake(mac)
          return standardMessage(msg, 'green', `:desktop: Sent WOL to [ ${capitalize(name)} ]`)
        }
      }
    }

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'list': {
        // Todo add listing functionality
        return channel.send(embed(msg, 'green'))
      }

      default: {
        const system = args[0]
        const command = args[1]
        const index = devices.findIndex((d) => d.name === system)
        const host = devices[index]
        return sendCommand(host, command)
      }
    }
  }
}
