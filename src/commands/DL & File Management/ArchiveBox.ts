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
    const { standardMessage, errorMessage, execAsync, embed, missingConfig } = Utils
    const { channel } = msg

    // Load configuration from database
    const db = await database.models.Configs.findOne({ where: { id: client.config.ownerID } })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { path } = config.archivebox

    if (!path) {
      return missingConfig(msg, 'ArchiveBox', ['config set archivebox path [path to archivebox]'])
    }

    await channel.send(
      embed(msg, 'green', 'archivebox.png').setDescription(`**:printer: Archiving the url

    - ${args[0]}s

    :hourglass: This may take some time...**`)
    )

    // Attempt to archive the url
    const { code } = await execAsync(`cd ${path} && echo "${args[0]}" | ./archive`, {
      silent: true
    })

    if (code !== 0) return errorMessage(msg, `Failed to archive [ ${args[0]} ]`)

    return standardMessage(
      msg,
      'green',
      `Archive of [ ${args[0]} ] complete!
      You can find it [here](https://atriox.io)`
    )
  }
}
