/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GuildChannel, Message } from 'discord.js'
import { performance } from 'perf_hooks'
import { ExecAsync, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { NezukoClient } from '../../core/NezukoClient'

/**
 * Add roles to users
 */
export default class DriveSize extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'drivesize',
      category: 'Owner',
      description: 'Updates the file and size counts on channel names for Rclone',
      ownerOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { embed, bytesToSize, millisecondsToTime, execAsync } = client.Utils
    const { guild } = msg
    const { Log } = client

    // * ------------------ Logic --------------------

    const configPath = `${__dirname}/../../config/rclone.conf`

    const driveSizeChannel = guild.channels.get('664102340621500416') as GuildChannel

    const remotes = [
      'tld-websites',
      'tld-0day',
      'tld-anime',
      'tld-books',
      'tld-games',
      'tld-main',
      'tld-music',
      'tld-programs',
      'tld-showsMovies'
    ]

    let totalSize = 0

    const startTime = performance.now()

    const waitMessage = (await msg.channel.send(
      embed(msg, 'blue', 'rclone.gif')
        .setTitle('Scanning configured remotes')
        .addField('Currently Scanning', remotes[0])
    )) as Message

    const scannedRemotes: string[] = []

    for (const remote of remotes) {
      delete remotes[remote]

      await waitMessage.edit(
        embed(msg, 'blue', 'rclone.gif')
          .setTitle('Scanning configured remotes')
          .addField('Currently Scanning', remote)
          .addField('Remaining', `${remotes.length ? remotes.join(', ') : '--'}`)
          .addField('Scanned', `${scannedRemotes.length ? scannedRemotes.join(', ') : '--'}`)
          .addField('Total Size So Far', bytesToSize(totalSize))
      )
      scannedRemotes.push(remote)

      const { code, stdout } = (await execAsync(`rclone size --json "${remote}:/" --config="${configPath}"`, {
        silent: true
      })) as ExecAsync

      if (code === 0) totalSize += JSON.parse(stdout).bytes
    }

    if (driveSizeChannel) {
      await driveSizeChannel.setName(
        `📁size ${bytesToSize(totalSize)
          .replace('.', '_')
          .replace(' ', '\u2009\u2009\u2009')}`
      )
    }

    const stopTime = performance.now()
    return waitMessage.edit(
      embed(msg, 'blue', 'rclone.gif')
        .setTitle('Rclone Size Scan Complete')
        .addField('Total Size', bytesToSize(totalSize))
        .addField('Completed In', millisecondsToTime(stopTime - startTime))
    )
  }
}
