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

export default class SystemInfo extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'si',
      category: 'Utils',
      description: 'Live system stats',
      usage: ['si <interval in seconds>'],
      ownerOnly: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[], api) {
    // * ------------------ Setup --------------------
    const { bytesToSize, embed } = client.Utils
    const { channel, author } = msg
    const { round } = Math
    // * ------------------ Config --------------------
    if (!args[0]) args[0] = 1

    // * ------------------ Logic --------------------

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

    if (api) {
      return {
        cpu: await cpuInfo(),
        ram: await ramInfo()
      }
    }

    const ms = (await channel.send(embed(msg, 'green').setDescription('**:timer: Loading system stats..**'))) as Message
    await ms.react('🛑')

    const refreshEmbed = async () => {
      const cpuStats = await cpuInfo()
      const ramStats = await ramInfo()
      const { cores, percentage, load } = cpuStats
      const { total, free, used } = ramStats

      await ms.edit(
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

    await refreshEmbed()
    const interval = setInterval(async () => await refreshEmbed(), args[0] * 1000)

    const collected = await ms.awaitReactions(
      (reaction: MessageReaction, user: GuildMember) => ['🛑'].includes(reaction.emoji.name) && user.id === author.id,
      { max: 1 }
    )

    const foundReaction = collected.first()
    if (foundReaction) {
      if (foundReaction.emoji.name === '🛑') {
        clearInterval(interval)
        return ms.clearReactions()
      }
    }
  }
}
