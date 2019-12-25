/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { NezukoClient } from 'structures/NezukoClient'
import { Subprocess } from './Subprocess'
import enmap from 'enmap'
import fs from 'fs'
import path from 'path'

export class SubprocessManager {
  public client: NezukoClient
  public processes: any

  constructor(client: NezukoClient) {
    this.client = client
    this.processes = new enmap()

    if (!this.client || !(this.client instanceof NezukoClient)) {
      throw new Error('Discord Client is required')
    }
  }

  /**
   * Load sub proccesses from directory
   * @param dir Directory containing modules
   */
  public loadModules(dir: string) {
    const subprocesses = fs.readdirSync(dir)

    subprocesses.forEach((item: any) => {
      const location = path.join(dir, item, 'index.js')
      if (!fs.existsSync(location)) return

      const process = require(location)
      const instance = new process(this.client)
      instance.location = location

      if (!instance.disabled) {
        if (this.processes.has(instance.name)) {
          throw new Error('Subprocesses cannot have the same name')
        }

        this.processes.set(instance.name, instance)
      }
    })
    for (const subprocess of this.processes.values()) {
      this.startModule(subprocess)
    }
  }

  /**
   * Start the specified subprocess
   * @param subprocess Subprocess to start
   */
  public startModule(subprocess: Subprocess) {
    try {
      subprocess.run()
      this.client.Log.ok('Subprocess Manager', `Loaded [ ${subprocess.name} ]`)
    } catch (err) {
      this.client.Log.error('Subprocess', null, err)
    }
  }
}
