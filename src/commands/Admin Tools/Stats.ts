/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { database } from '../../core/database/database'
import { StatsManager } from '../../core/managers/StatsManager'
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
      description: 'Enable / disabled the server stats sidebar',
      usage: ['stats enable', 'stats disable'],
      args: true,
      permsNeeded: ['MANAGE_GUILD']
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, p } = client
    const { warningMessage, validOptions, standardMessage, embed } = Utils
    const { channel, guild } = msg

    // * ------------------ Config --------------------

    const db = await database.models.Servers.findOne({ where: { id: guild.id } })

    const statChannels = JSON.parse(db.get('statChannels') as string) as StatSettings

    // * ------------------ Usage Logic --------------------

    // TODO let user enable / disable specific stats
    switch (args[0]) {
      case 'enable': {
        statChannels.enabled = true
        await db.update({
          statChannels: JSON.stringify(statChannels)
        })
        await StatsManager.updateStats(guild)
        return standardMessage(msg, 'green', 'Server stat sidebar has been enabled')
      }
      case 'disable': {
        statChannels.enabled = false
        await db.update({
          statChannels: JSON.stringify(statChannels)
        })

        // TODO make this delete all channels and category for server stats
        const { total, bots, members, categoryID } = statChannels

        // * delete all stat channels and category

        if (categoryID) {
          const categoryToDelete = guild.channels.get(categoryID)
          if (categoryToDelete) {
            await categoryToDelete.delete()
            statChannels.categoryID = null
            await db.update({
              statChannels: JSON.stringify(statChannels)
            })
          }
        }

        if (total.channelID) {
          const channelToDelete = guild.channels.get(total.channelID)
          if (channelToDelete) {
            await channelToDelete.delete()
            statChannels.total.channelID = null
            await db.update({
              statChannels: JSON.stringify(statChannels)
            })
          }
        }

        if (members.channelID) {
          const channelToDelete = guild.channels.get(members.channelID)
          if (channelToDelete) {
            await channelToDelete.delete()
            statChannels.members.channelID = null
            await db.update({
              statChannels: JSON.stringify(statChannels)
            })
          }
        }

        if (bots.channelID) {
          const channelToDelete = guild.channels.get(bots.channelID)
          if (channelToDelete) {
            await channelToDelete.delete()
            statChannels.bots.channelID = null
            await db.update({
              statChannels: JSON.stringify(statChannels)
            })
          }
        }

        return standardMessage(msg, 'green', 'Server stat sidebar has been disabled and deleted all stat channels')
      }

      default:
        return validOptions(msg, ['enable', 'disable'])
    }
  }
}
