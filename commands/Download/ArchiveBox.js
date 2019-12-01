const Command = require('../../core/Command')

module.exports = class ArchiveBox extends Command {
  constructor(client) {
    super(client, {
      name: 'archive',
      category: 'Download',
      description: 'Archive web pages with ArchiveBox',
      usage: ['a <url to archive>'],
      aliases: ['a'],
      args: true,
      webUI: false
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { standardMessage, errorMessage, execAsync, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const { path } = db.config.archivebox

    // * ------------------ Logic --------------------
    await channel.send(
      embed('green', 'archivebox.png').setDescription(`**:printer: Archiving the url

    - ${args[0]}

    :hourglass: This may take some time...**`)
    )

    const { code } = await execAsync(`cd ${path} && echo "${args[0]}" | ./archive`, {
      silent: true
    })

    if (code !== 0) return errorMessage(msg, `Failed to archive [ ${args[0]} ]`)

    return standardMessage(
      msg,
      `Archive of [ ${args[0]} ] complete!
      You can find it [here](https://atriox.io)`
    )
  }
}
