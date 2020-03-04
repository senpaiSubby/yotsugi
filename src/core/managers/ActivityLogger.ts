/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Collection, Message } from 'discord.js'
import { database } from '../database/database'

export class ActivityLogger {
  public cooldowns: any

  constructor() {
    this.cooldowns = new Collection()
  }

  public async log(msg: Message) {
    const { guild, author, content } = msg

    /**
     * Log user message activity
     * reset on a monthly basis
     * TODO leaderboard command
     */

    const db = await database.models.Servers.findOne({ where: { id: guild.id } })
    const config = JSON.parse(db.get('userActivity') as string)

    if (content.startsWith('//') || !content.length) return

    // Give a activity point
    if (!config[author.id]) {
      config[author.id] = { score: 0, active: true, inactive: false, userID: author.id }
      console.log('new user')
    }

    // ------------

    // If command isn't in cooldown then set it
    if (!this.cooldowns.has(author.id)) this.cooldowns.set(author.id, new Collection())

    // Get current date
    const now = Date.now()
    // Get time the last command was ran
    const timestamps = this.cooldowns.get(author.id)
    // Get cooldown time from command
    const cooldownAmount = 1000
    // If command is in cooldown
    if (timestamps.has(author.id)) {
      // Get time left till command can be ran again
      const expirationTime = timestamps.get(author.id) + cooldownAmount
      // If cooldown time hasnt passed then notify user
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        return console.log(`${author.username} spamming ${timeLeft} left`)
      }
    }
    // Add user to command cooldown
    timestamps.set(author.id, now)

    // ------------

    config[author.id].score++

    // If user hits 20 points in monthly activity then assign them to activeMembers

    // Else if under assign to inactiveMembers

    await db.update({ userActivity: JSON.stringify(config) })
  }
}
