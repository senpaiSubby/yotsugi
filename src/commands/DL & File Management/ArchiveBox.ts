/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

/**
 * Command to save web pages into your archivebox server
 */
export default class ArchiveBox extends Command {
  constructor(client: BotClient) {
    super(client, {
      aliases: ['a'],
      args: true,
      category: 'DL & File Management',
      description: 'Archive web pages via ArchiveBox',
      name: 'archive',
      usage: ['a <url to archive>'],
      webUI: false
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { standardMessage, errorMessage, execAsync, embed, missingConfig } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { path } = config.archivebox

    // If archivebox path is not set
    if (!path) {
      return missingConfig(msg, 'ArchiveBox', ['config set archivebox path [path to archivebox]'])
    }

    // * ------------------ Logic --------------------

    // Let the user know the archiving is beginning
    await channel.send(
      embed(msg, 'green', 'archivebox.png').setDescription(`**:printer: Archiving the url

    - ${args[0]}

    :hourglass: This may take some time...**`)
    )

    // Attempt to archive the url
    const { code } = await execAsync(`cd ${path} && echo "${args[0]}" | ./archive`, {
      silent: true
    })

    // If exit code isn't 0 then the archive failed
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
