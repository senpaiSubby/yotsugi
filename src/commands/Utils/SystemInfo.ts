/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GuildMember, Message, MessageReaction } from 'discord.js'
import { cpu } from 'node-os-utils'
import { arch, hostname, release, type } from 'os'
import si from 'systeminformation'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'

/**
 * Command to view live system information of the server the bot is hosted on
 */
export default class SystemInfo extends Command {
  constructor(client: BotClient) {
    super(client, {
      category: 'Utils',
      description: 'Live system stats',
      name: 'si',
      ownerOnly: true,
      usage: ['si <interval in seconds>']
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    const { bytesToSize, embed } = Utils
    const { channel, author } = msg
    const { round } = Math

    // If user doesn't specify a refresh time set to 1 second
    if (!args[0]) args[0] = 1

    const cpuInfo = async () => {
      const coreCount = cpu.count()
      const cpuPercent = round(await cpu.usage())
      let loadAverage = ''
      cpu.loadavg().forEach((i) => (loadAverage += `${round(i)}% `))
      return {
        cores: coreCount,
        percentage: cpuPercent,
        load: loadAverage.trim()
      }
    }

    const ramInfo = async () => {
      const ram = await si.mem()
      return {
        total: bytesToSize(ram.total),
        used: bytesToSize(ram.active),
        free: bytesToSize(ram.available)
      }
    }

    // * ------------------ Usage Logic --------------------

    // Send wait message to let user know stats are loading
    const waitMessage = await channel.send(embed(msg, 'green').setDescription('**:timer: Loading system stats..**'))

    // React with a stop sign so when click live stats will stop
    await waitMessage.react('🛑')

    /**
     * Refreshes waitMessage with updated stats
     */
    const refreshEmbed = async () => {
      const cpuStats = await cpuInfo()
      const ramStats = await ramInfo()
      const { cores, percentage, load } = cpuStats
      const { total, free, used } = ramStats

      return waitMessage.edit(
        embed(msg, 'green')
          .setTitle(':computer: Live System Stats')
          .addField('Host', `**[${hostname()}] ${type()} ${arch()} ${release()}**`)
          .addField('CPU Cores', cores, true)
          .addField('CPU Usage', percentage, true)
          .addField('CPU Load', load, true)
          .addField('RAM Total', total, true)
          .addField('RAM Free', free, true)
          .addField('RAM Used', used, true)
      )
    }

    // Update waitMessage with current stats
    await refreshEmbed()

    // Refresh waitMessage with current stats every x seconds specified by user
    const interval = setInterval(async () => await refreshEmbed(), args[0] * 1000)

    // Await the stop sign reaction
    const collected = await waitMessage.awaitReactions(
      (reaction: MessageReaction, user: GuildMember) => ['🛑'].includes(reaction.emoji.name) && user.id === author.id,
      { max: 1 }
    )

    // If reacted with stop sign stop refreshing stats
    const foundReaction = collected.first()
    if (foundReaction) {
      if (foundReaction.emoji.name === '🛑') {
        clearInterval(interval)
        return waitMessage.reactions.removeAll()
      }
    }
  }
}
