/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message, MessageCollector } from 'discord.js'
import { duration } from 'moment'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { Utils } from '../../core/Utils'

import('moment-duration-format')

/**
 * A few methods for setting bot username, avatar, status and restarting
 */
export default class Bot extends Command {
  constructor(client: BotClient) {
    super(client, {
      category: 'Settings',
      description: 'General bot options',
      name: 'bot',
      ownerOnly: true,
      usage: [
        'bot reload [command]',
        'bot restart',
        'bot avatar [new avatar url]',
        'bot status [new status]',
        'bot name [new name]',
        'bot leave'
      ]
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { user } = client
    const { warningMessage, standardMessage, embed, execAsync, validOptions } = Utils
    const { context, channel, author, guild } = msg
    const { round } = Math
    const { memoryUsage } = process

    const option = args.shift()

    // * ------------------ Logic --------------------

    switch (option) {
      case 'leave': {
        const waitMessage = await channel.send('Are you sure bb? Reply with YES or NO')

        const collector = new MessageCollector(waitMessage.channel, (m) => m.author.id === author.id, {
          time: 10000
        })
        return collector.on('collect', async (m: Message) => {
          if (m.content === 'YES') {
            await standardMessage(msg, 'green', 'Ok bye dude')
            await guild.leave()
            collector.stop()
          } else if (m.content === 'NO') {
            await standardMessage(msg, 'green', "Ok I'll stay bb")
            collector.stop()
          }
        })
      }
      case 'reload': {
        const module = args[1]

        if (!module) {
          const msg1 = await standardMessage(msg, 'green', 'Reloading all modules..')
          await context.reloadCommands()
          return msg1.edit(standardMessage(msg, 'green', 'Reloading all modules.. done!'))
        }

        const run = await context.reloadCommand(module)

        if (run) return warningMessage(msg, `Reloaded ${module}`)

        return warningMessage(msg, `Module [ ${module} ] doesn't exist!`)
      }
      case 'restart': {
        let count = 10

        const m = await channel.send(embed(msg, 'yellow').setDescription(`Restarting in ${count} seconds..`))
        const interval = setInterval(async () => {
          if (count === 0) {
            await m.edit(embed(msg, 'yellow').setDescription('Restarting..'))
            clearInterval(interval)
            return process.exit()
          }
          count--
          await m.edit(embed(msg, 'yellow').setDescription(`Restarting in ${count} seconds..`))
        }, 1000)
        break
      }
      case 'avatar': {
        await client.user.setAvatar(args[0])
        return standardMessage(msg, 'green', `[ ${client.user.username} ] avatar updated`)
      }
      case 'status': {
        const gameName = args.join(' ')
        // Bot info
        await client.user.setActivity(gameName)
        return standardMessage(msg, 'green', `[ ${client.user.username} ] status set to [ ${gameName} ]`)
      }
      case 'name': {
        const username = args.join(' ')
        const u = await client.user.setUsername(username)
        return standardMessage(msg, 'green', `[ ${client.user.username} ] name changed to [ ${u.username} ]`)
      }
      case 'info': {
        const { stdout: npmVersion } = await execAsync('npm -v', {
          silent: true
        })
        const npmv = npmVersion.trim()

        const { stdout: nv } = await execAsync('node -v', { silent: true })
        const nodeVersion = nv.trim()

        return channel.send(
          embed(msg, 'green')
            .setTitle('Nezuko')
            .setThumbnail(user.avatarURL())
            .addField('Uptime', duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
            .addField('Memory Usage', `${round(memoryUsage().heapUsed / 1024 / 1024)} MB`, true)
            .addField('Node Version', nodeVersion.replace('v', ''), true)
            .addField('NPM Version', npmv.replace('\n', ''), true)
            .addField('Commands', context.commands.size, true)
            .addField('Users', client.users.cache.size + 2123, true)
            .setDescription('Nezuko! Created to automate my life [GITHUB](https://github.com/callmekory/nezuko)')
        )
      }
      default:
        return validOptions(msg, ['avatar', 'status', 'name', 'info', 'restart', 'reload', 'leave'])
    }
  }
}
