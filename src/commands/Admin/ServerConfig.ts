/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'

export default class ServerConfig extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'server',
      category: 'Admin',
      description: 'Set/Get server config for bot',
      usage: ['server get', 'server set <key> <value'],
      args: true,
      permsNeeded: ['MANAGE_GUILD']
    })
  }

  /**
   * Run this command
   * @param client Nezuko client
   * @param msg Original message
   * @param args Optional arguments
   */
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, serverConfig, p } = client
    const { warningMessage, validOptions, standardMessage, embed } = Utils
    const { channel, guild } = msg

    msg.delete(10000)

    // * ------------------ Config --------------------

    const db = await serverConfig.findOne({ where: { id: guild.id } })
    const { server } = client.db!

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'get': {
        delete server.rules
        const keys = Object.keys(server).sort()

        const e = embed('green', 'settings.png')
          .setTitle('Server Config')
          .setDescription(`**[ ${p}server set <settings> <new value> ] to change**`)

        keys.forEach((i) => e.addField(`${i}`, `${server[i]}`, false))
        return channel.send(e)
      }

      case 'set': {
        const keyToChange = args[1]
        const newValue = args[2]
        if (keyToChange in server) {
          server[keyToChange] = newValue
          await db.update({ config: JSON.stringify(server) })
          const m = (await standardMessage(
            msg,
            `[ ${keyToChange} ] changed to [ ${newValue} ]`
          )) as NezukoMessage
          return m.delete(10000)
        }
        return warningMessage(msg, `[${keyToChange}] doesnt exist`)
      }
      default:
        return validOptions(msg, ['get', 'set'])
    }
  }
}
