/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'

/**
 * Get and set server config
 */
export default class Config extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'server',
      category: 'Moderation',
      description: 'Set/Get server config for bot',
      usage: ['server', 'server set <key> <value'],
      permsNeeded: ['MANAGE_GUILD']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, p } = client
    const { warningMessage, validOptions, standardMessage, embed } = Utils
    const { channel, guild } = msg

    // * ------------------ Config --------------------

    const db = await database.models.Servers.findOne({
      where: { id: guild.id }
    })

    const server = JSON.parse(db.get('config') as string) as ServerDBConfig

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      // Set server settings
      case 'set': {
        // Setting to change
        const keyToChange = args[1] as string
        // New value
        const newValue = args[2] as string

        // If the setting exists
        if (keyToChange in server) {
          // Change key to new one
          server[keyToChange] = newValue
          // Update the database
          await db.update({ config: JSON.stringify(server) })
          // Notify the user
          return standardMessage(
            msg,
            'green',
            `[ ${keyToChange} ] changed to [ ${newValue} ]`
          )
        } // If the setting doesn't exist
        return warningMessage(msg, `[${keyToChange}] doesn't exist`)
      }
      // Get the current server settings
      default: {
        args.shift()
        // Remove the server rules key to remove bloat from
        // The info embed
        delete server.rules

        // Sort keys
        let keys = Object.keys(server).sort()

        if (args.length) {
          // Info embed
          const e = embed(msg, 'green', 'settings.png')
            .setTitle(`Server Config [ ${args[0]} ]`)
            .setDescription(
              `**[ ${p}server set <${args[0]}> <setting> <new value> ] to change\nChannel and roles are set via ID**`
            )

          // Add a new field to the embed for every key in the settings
          const values = server[args[0]]
          // Sort keys
          keys = Object.keys(values).sort()

          // Add a new field to the embed for every key in the settings
          keys.forEach((i) =>
            e.addField(`${i}`, `${server[i] ? server[i] : 'false'}`, true)
          )

          // Ship it off
          return channel.send(e)
        }

        // Info embed
        const e = embed(msg, 'green', 'settings.png')
          .setTitle('Server Config')
          .setDescription(
            `**[ ${p}server set <settings> <new value> ] to change**`
          )

        // Add a new field to the embed for every key in the settings
        keys.forEach((i) => {
          e.addField(
            `${i}`,
            `${
              server[i] ? server[i] : server[i] === false ? 'false' : 'unset'
            }`,
            true
          )
        })

        // Ship it off
        return channel.send(e)
      }
    }
  }
}
