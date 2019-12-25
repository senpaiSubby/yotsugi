/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { Command } from '../../core/Command'
import { NezukoClient } from 'structures/NezukoClient'
import { NezukoMessage } from 'types'

export default class ArchiveBox extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'archive',
      category: 'Download',
      description: 'Archive web pages via ArchiveBox',
      usage: ['a <url to archive>'],
      aliases: ['a'],
      args: true,
      webUI: false
    })
  }

  /**
   * Run this command
   * @param client Nezuko client
   * @param msg Original message
   * @param args Optional arguments
   */
  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { standardMessage, errorMessage, execAsync, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { path } = db!.config.archivebox

    // * ------------------ Logic --------------------
    await channel.send(
      embed('green', 'archivebox.png').setDescription(`**:printer: Archiving the url

    - ${args[0]}

    :hourglass: This may take some time...**`)
    )

    const { code } = (await execAsync(`cd ${path} && echo "${args[0]}" | ./archive`, {
      silent: true
    })) as any

    if (code !== 0) return errorMessage(msg, `Failed to archive [ ${args[0]} ]`)

    return standardMessage(
      msg,
      `Archive of [ ${args[0]} ] complete!
      You can find it [here](https://atriox.io)`
    )
  }
}
