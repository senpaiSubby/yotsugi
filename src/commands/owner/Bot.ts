/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Message } from 'discord.js'
import { duration } from 'moment'
import { ExecAsync, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

import('moment-duration-format')

export default class Reload extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'bot',
      category: 'Owner',
      description: 'Bot Commands',
      ownerOnly: true,
      usage: [
        'bot reload <command>',
        'bot restart',
        'bot avatar <new avatar url>',
        'bot status <new status>',
        'bot name <new name>'
      ]
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------
    const { user } = client
    const { warningMessage, standardMessage, embed, execAsync } = client.Utils
    const { context, channel } = msg
    const { round } = Math
    const { memoryUsage } = process

    const option = args[0]
    args.shift()

    // * ------------------ Logic --------------------

    switch (option) {
      case 'reload': {
        const module = args[1]

        if (!module) {
          const msg1 = (await standardMessage(msg, `Reloading all modules..`)) as Message
          await context.reloadCommands()
          return msg1.edit(standardMessage(msg, `Reloading all modules.. done!`))
        }

        const run = await context.reloadCommand(module)

        if (run) return warningMessage(msg, `Reloaded ${module}`)

        return warningMessage(msg, `Module [ ${module} ] doesn't exist!`)
      }
      case 'restart': {
        let count = 10

        const m = (await channel.send(embed('yellow').setDescription(`Restarting in ${count} seconds..`))) as Message
        const interval = setInterval(async () => {
          if (count === 0) {
            await m.edit(embed('yellow').setDescription(`Restarting..`))
            clearInterval(interval)
            return process.exit()
          }
          count--
          await m.edit(embed('yellow').setDescription(`Restarting in ${count} seconds..`))
        }, 1000)
        break
      }
      case 'avatar': {
        await client.user.setAvatar(args[0])
        return standardMessage(msg, `[ ${client.user.username} ] avatar updated`)
      }
      case 'status': {
        const gameName = args.join(' ')
        // Bot info
        await client.user.setActivity(gameName)
        return standardMessage(msg, `[ ${client.user.username} ] status set to [ ${gameName} ]`)
      }
      case 'name': {
        const username = args.join(' ')
        const u = await client.user.setUsername(username)
        return standardMessage(msg, `[ ${client.user.username} ] name changed to [ ${u.username} ]`)
      }
      case 'info': {
        const { code: c, stdout: npmVersion } = (await execAsync('npm -v', {
          silent: true
        })) as ExecAsync
        const npmv = npmVersion.trim()

        const { code, stdout: nv } = (await execAsync('node -v', { silent: true })) as ExecAsync
        const nodeVersion = nv.trim()

        return channel.send(
          embed('green')
            .setTitle(`Nezuko Status`)
            .setThumbnail(user.avatarURL)
            .addField('Uptime', duration(client.uptime).format('d[d] h[h] m[m] s[s]'), true)
            .addField('Memory Usage', `${round(memoryUsage().heapUsed / 1024 / 1024)} MB`, true)
            .addField('Node Version', nodeVersion.replace('v', ''), true)
            .addField('NPM Version', npmv.replace('\n', ''), true)
            .addField('Commands', context.commands.size, true)
            .setDescription(`Nezuko! Created to automate my life [GITHUB](https://github.com/callmekory/nezuko)`)
        )
      }
    }
  }
}
