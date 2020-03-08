/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Guild, GuildChannel } from 'discord.js'
import { database } from '../database/database'

export class StatsManager {
  public static async updateStats(guild: Guild) {
    // * Update Server Channel Stats
    // 📈

    const db = await database.models.Servers.findOne({
      where: { id: guild.id }
    })

    if (db) {
      const statChannels = JSON.parse(
        db.get('statChannels') as string
      ) as StatSettings
      const { total, bots, members, enabled } = statChannels
      let { categoryID } = statChannels
      let categoryChannel: GuildChannel

      const createCategory = async () => {
        const newCategory = await guild.createChannel('📈 Nezuko Stats 📈', {
          type: 'category'
        })
        categoryID = newCategory.id
        statChannels.categoryID = newCategory.id
        categoryChannel = guild.channels.get(categoryID)
        await db.update({ statChannels: JSON.stringify(statChannels) })
      }

      // If stats are enabled

      if (enabled) {
        // Create Stats Category
        if (!categoryID || !categoryChannel) await createCategory()
        // Create Channels Under Category
        categoryChannel = guild.channels.get(categoryID)

        const createVoiceChannel = async (
          type: 'total' | 'members' | 'bots'
        ) => {
          const newChannel = await guild.createChannel(type, { type: 'voice' })
          await newChannel.setParent(categoryChannel)

          switch (type) {
            case 'total': {
              total.channelID = newChannel.id
              statChannels.total.channelID = newChannel.id
              return db.update({ statChannels: JSON.stringify(statChannels) })
            }

            case 'members': {
              members.channelID = newChannel.id
              statChannels.members.channelID = newChannel.id
              return db.update({ statChannels: JSON.stringify(statChannels) })
            }

            case 'bots': {
              bots.channelID = newChannel.id
              statChannels.bots.channelID = newChannel.id
              return db.update({ statChannels: JSON.stringify(statChannels) })
            }
          }
        }

        // Create channels if they dont exist and are enabled
        if (!total.channelID && total.enabled) await createVoiceChannel('total')
        if (!members.channelID && members.enabled) {
          await createVoiceChannel('members')
        }
        if (!bots.channelID && bots.enabled) await createVoiceChannel('bots')

        // Update stats if they are enabled
        const updateStats = async (
          type: string,
          channel: string,
          name: string
        ) => {
          const channelToChange = guild.channels.get(channel)
          if (channelToChange) {
            channelToChange.setName(name)
          } else {
            statChannels[type] = null
            await db.update({ statChannels: JSON.stringify(statChannels) })
          }
        }

        if (total.enabled) {
          await updateStats(
            'total',
            total.channelID,
            `ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀs: ${guild.members.size}`
          )
        }
        if (members.enabled) {
          await updateStats(
            'members',
            members.channelID,
            `ᴜsᴇʀs: ${guild.members.filter((m) => !m.user.bot).size}`
          )
        }
        if (bots.enabled) {
          await updateStats(
            'bots',
            bots.channelID,
            `ʙᴏᴛs: ${guild.members.filter((m) => m.user.bot).size}`
          )
        }
      }
    }
  }
}
