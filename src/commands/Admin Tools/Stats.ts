/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage, ServerDBConfig } from 'typings'

import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * TODO make stats togglable
 * Get and set server config
 */
export default class Stats extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'stats',
      category: 'Admin Tools',
      description: 'Set/Get server stats config for server info',
      usage: ['stats config', 'server set <key> <channel Id>'],
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, p } = client
    const { warningMessage, validOptions, standardMessage, embed } = Utils
    const { channel, guild } = msg

    // * ------------------ Config --------------------

    const db = await database.models.Servers.findOne({ where: { id: guild.id } })

    const statChannels = JSON.parse(db.get('statChannels') as string)
    console.log(statChannels)

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      // Get the current server settings
      case 'config': {
        args.shift()
        // Remove the server rules key to remove bloat from
        // The info embed

        // Sort keys
        let keys = Object.keys(statChannels).sort()

        // Info embed
        const e = embed(msg, 'green', 'settings.png')
          .setTitle('Server Stats Config')
          .setDescription(`**[ ${p}stats set <setting> <channel ID> ] to change**`)

        // Add a new field to the embed for every key in the settings
        keys.forEach((i) => e.addField(`${i}`, `${statChannels[i] ? statChannels[i] : 'unset'}`, true))

        // Ship it off
        return channel.send(e)
      }
      // Set server settings
      case 'set': {
        // Setting to change
        const keyToChange = args[1] as string
        // New value
        const newValue = args[2] as string

        // If the setting exists
        if (keyToChange in statChannels) {
          // Change key to new one
          statChannels[keyToChange] = newValue
          // Update the database
          await db.update({ statChannels: JSON.stringify(statChannels) })
          // Notify the user
          return standardMessage(msg, 'green', `[ ${keyToChange} ] changed to channel ID [ ${newValue} ]`)
        } // If the setting doesnt exist
        return warningMessage(msg, `[${keyToChange}] doesnt exist`)
      }
      // If neither 'set' or 'get' where specified as options inform the user
      // Of the correct options
      default:
        return validOptions(msg, ['config', 'set'])
    }
  }
}
