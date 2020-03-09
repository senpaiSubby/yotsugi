/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { existsSync } from 'fs'
import { join } from 'path'
import { spawn } from 'promisify-child-process'
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
    const configPath = join(`${__dirname}/../../config/rclone.conf`)
    console.log(configPath)

    // * ------------------ Check Config --------------------

    if (!existsSync(configPath)) {
      return console.log(`RClone config is missing!
        Place your \`rclone.conf\` file inside the \`/build/config\` directory of Nezuko!`)
    }

    const fetchRemotes = async () => {
      const { code, stdout } = await execAsync(
        `rclone listremotes --config='${configPath}'`,
        {
          silent: true
        }
      )

      if (code !== 0) {
        console.log(`A error occurred with Rclone when listing remotes`)
      } else {
        return stdout
          .replace(/:/g, '')
          .split('\n')
          .filter(Boolean)
      }
    }

    const updateRcloneCache = async () => {
      const remotes = await fetchRemotes()

      if (remotes) {
        for (const remote of remotes) {
          // @ts-ignore
          const { stdout, stderr } = await spawn(
            `rclone`,
            [`--config=${configPath} lsjson ${remote}:/ --fast-list -R`],
            {
              maxBuffer: 500 * 1024 * 1024,
              shell: true
            }
          )

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

          await db.update({ cache: stdout })
        }
      }
    }

    updateRcloneCache()
    setInterval(async () => updateRcloneCache(), 1000 * 60 * 60 * 6)
  }
}
