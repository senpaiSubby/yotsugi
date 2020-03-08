/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class ArchiveBox extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'archive',
      category: 'Management',
      description: 'Archive web pages via ArchiveBox',
      usage: ['a <url to archive>'],
      aliases: ['a'],
      args: true,
      webUI: false
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const {
      standardMessage,
      errorMessage,
      execAsync,
      embed,
      missingConfig
    } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { path } = db!.config!.archivebox

    // If archivebox path is not set
    if (!path) {
      return missingConfig(msg, 'ArchiveBox', [
        'config set archivebox path <path to archivebox>'
      ])
    }

    // * ------------------ Logic --------------------

    // Let the user know the archiving is beginning
    await channel.send(
      embed(msg, 'green', 'archivebox.png')
        .setDescription(`**:printer: Archiving the url

    - ${args[0]}

    :hourglass: This may take some time...**`)
    )

    // Attempt to archive the url
    const { code } = await execAsync(
      `cd ${path} && echo "${args[0]}" | ./archive`,
      {
        silent: true
      }
    )

    // If exit code isnt 0 then the archive failed
    if (code !== 0) return errorMessage(msg, `Failed to archive [ ${args[0]} ]`)

    // Notify that archive is complete
    return standardMessage(
      msg,
      'green',
      `Archive of [ ${args[0]} ] complete!
      You can find it [here](https://atriox.io)`
    )
  }
}
