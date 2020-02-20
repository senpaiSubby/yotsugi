import { database } from '../../core/database/database'
import { Guild, GuildChannel } from 'discord.js'

export class StatsManager {
  static async updateStats(guild: Guild) {
    // * Update Server Channel Stats
    // 📈

    const db = await database.models.Servers.findOne({
      where: { id: guild.id }
    })

    if (db) {
      const statChannels = JSON.parse(db.get('statChannels') as string)
      let { total, bots, members, categoryID } = statChannels as any

      let categoryChannel: GuildChannel

      const createCategory = async () => {
        const newCategory = await guild.createChannel('📈 Nezuko Stats 📈', { type: 'category' })
        categoryID = newCategory.id
        statChannels.categoryID = newCategory.id
        categoryChannel = guild.channels.get(categoryID)
        await db.update({ statChannels: JSON.stringify(statChannels) })
      }

      // Create Stats Category
      if (!categoryID || !categoryChannel) await createCategory()
      // Create Channels Under Category
      categoryChannel = guild.channels.get(categoryID)

      const createVoiceChannel = async (type: string) => {
        const newChannel = await guild.createChannel(type, { type: 'voice' })
        await newChannel.setParent(categoryChannel)

        switch (type) {
          case 'total': {
            total = newChannel.id
            statChannels.total = newChannel.id
            return db.update({ statChannels: JSON.stringify(statChannels) })
          }
          case 'members': {
            members = newChannel.id
            statChannels.members = newChannel.id
            return db.update({ statChannels: JSON.stringify(statChannels) })
          }
          case 'bots': {
            bots = newChannel.id
            statChannels.bots = newChannel.id
            return db.update({ statChannels: JSON.stringify(statChannels) })
          }
        }
      }

      // Create channels if they dont exist
      if (!total) await createVoiceChannel('total')
      if (!members) await createVoiceChannel('members')
      if (!bots) await createVoiceChannel('bots')

      // Update stats
      const updateStats = async (type: string, channel: string, name: string) => {
        try {
          guild.channels.get(channel).setName(name)
        } catch {
          statChannels[type] = null
          await db.update({ statChannels: JSON.stringify(statChannels) })
        }
      }

      await updateStats('total', total, `ᴛᴏᴛᴀʟ   ᴍᴇᴍʙᴇʀs:   ${guild.members.size}`)
      await updateStats('members', members, `ᴜsᴇʀs:   ${guild.members.filter((m) => !m.user.bot).size}`)
      await updateStats('bots', bots, `ʙᴏᴛs:   ${guild.members.filter((m) => m.user.bot).size}`)
    }
  }
}
