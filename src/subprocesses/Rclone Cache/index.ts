/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { existsSync } from 'fs'
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

export default class RcloneCache extends Subprocess {
  constructor(client: BotClient) {
    super(client, {
      name: 'Rclone Cache',
      description: 'Caches rclone ls results for the "rclone find command"',
      disabled: false
    })

    this.client = client
  }

  public async run() {
    const { execAsync } = Utils
    const configPath = `${__dirname}/../../config/rclone.conf`

    // * ------------------ Check Config --------------------

    if (!existsSync(configPath)) {
      return console.log(`RClone config is missing!
        Place your \`rclone.conf\` file inside the \`/build/config\` directory of Nezuko!`)
    }

    const updateRcloneCache = async () => {
      const { code, stdout } = await execAsync(
        `rclone listremotes --config='${configPath}'`,
        {
          silent: true
        }
      )

      if (code !== 0) {
        return console.log(`A error occurred with Rclone when listing remotes`)
      }

      const remotes = stdout
        .replace(/:/g, '')
        .split('\n')
        .filter(Boolean)

      for (const remote of remotes) {
        const {
          code: c,
          stdout: s
        } = await execAsync(
          `rclone --config='${configPath}' lsjson ${remote}:/ --fast-list -R`,
          { silent: true }
        )

        if (code !== 0) {
          return console.log(`Error scanning remote [ ${remote} ]`)
        }

        let db = await database.models.RcloneCache.findOne({
          where: { id: remote }
        })

        if (!db) {
          // Create new db for remote cache
          await database.models.RcloneCache.create({
            id: remote,
            cache: JSON.stringify([])
          })

          db = await database.models.RcloneCache.findOne({
            where: { id: remote }
          })
        }

        const x = s
        console.log(x)

        await db.update({ cache: s })
      }
    }

    updateRcloneCache()
    setInterval(async () => updateRcloneCache(), 1000 * 60 * 60 * 6)
  }
}
