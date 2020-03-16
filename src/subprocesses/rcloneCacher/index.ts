/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { existsSync } from 'fs'
import { join } from 'path'
import { performance } from 'perf_hooks'
import { spawn } from 'promisify-child-process'
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { Utils } from '../../core/Utils'

export default class RcloneCacher extends Subprocess {
  constructor() {
    super({
      name: 'rcloneCacher',
      description: 'Caches rclone ls results for the "rclone find command"',
      disabled: false
    })
  }

  public async run(client: BotClient) {
    const { execAsync } = Utils
    const configPath = join(`${__dirname}/../../config/rclone.conf`)

    // * ------------------ Check Config --------------------

    // Check if config file exists
    if (!existsSync(configPath)) {
      return Log.warn(
        'Rclone Cache',
        `RClone config is missing!
        Place your \`rclone.conf\` file inside the \`/build/config\` directory of Nezuko!`
      )
    }

    /**
     * Fetches and returns the remotes from the supplied rclone config file
     */
    const fetchRemotes = async () => {
      const { code, stdout } = await execAsync(`rclone listremotes --config='${configPath}'`, {
        silent: true
      })

      // If listing remotes failed log to console
      if (code !== 0) {
        Log.error('Rclone Cache', 'A error occurred with Rclone when listing remotes')
      }
      // Else parse and return list of remotes
      else {
        return stdout
          .replace(/:/g, '')
          .split('\n')
          .filter(Boolean)
      }
    }

    /**
     * creates a cache of file info for each remote in the config.
     * Used by the `rclone find` command to searching for files
     */
    const updateRcloneCache = async () => {
      // Fetch remotes from config
      const remotes = await fetchRemotes()

      if (remotes) {
        for (const remote of remotes) {
          Log.info('Rclone Cache', `Updating cache for remote [ ${remote} ]`)

          // Get start time
          const start = performance.now()

          // Spawn shell and fetch json results from rclone
          // @ts-ignore
          const { stdout } = await execAsync(`rclone --config=${configPath} lsjson ${remote}:/ --fast-list -R`, {
            maxBuffer: 500 * 1024 * 1024,
            shell: true,
            silent: true
          })

          // Open database for remote
          let db = await database.models.RcloneCache.findOne({
            where: { id: remote }
          })

          // If no database then create a blank template one
          if (!db) {
            // Create new db for remote cache
            await database.models.RcloneCache.create({
              id: remote,
              cache: JSON.stringify([])
            })

            // Then reopen database
            db = await database.models.RcloneCache.findOne({
              where: { id: remote }
            })
          }

          // Update database with new file cache
          await db.update({ cache: stdout })

          // Get end time
          const stop = performance.now()

          Log.info(
            'Rclone Cache',
            `Cache update for remote [ ${remote} ] completed in [ ${Utils.millisecondsToTime(stop - start)} ]`
          )
        }
      }
    }

    // Update cache on bot start
    updateRcloneCache()

    // Update cache every 6 hours
    setInterval(async () => updateRcloneCache(), 1000 * 60 * 60 * 6)
  }
}
