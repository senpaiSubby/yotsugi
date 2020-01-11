/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import Enmap from 'enmap'
import fs from 'fs'
import path, { join } from 'path'

import { Subprocess } from '../base/Subprocess'
import { NezukoClient } from '../NezukoClient'

// tslint:disable: completed-docs

export class SubprocessManager {
  public client: NezukoClient
  public processes: any

  constructor(client: NezukoClient) {
    this.client = client
    this.processes = new Enmap()

    if (!this.client || !(this.client instanceof NezukoClient)) {
      throw new Error('Discord Client is required')
    }
  }

  public async loadModules(dir = join(__dirname, '..', '..', 'subprocesses')) {
    const subprocesses = fs.readdirSync(dir)

    for (const item of subprocesses) {
      const location = path.join(dir, item, 'index.js')
      if (!fs.existsSync(location)) return

      // tslint:disable-next-line:variable-name
      const Process = require(location).default
      const instance = new Process(this.client)
      instance.location = location

      if (!instance.disabled) {
        if (this.processes.has(instance.name)) {
          throw new Error('Subprocesses cannot have the same name')
        } else this.processes.set(instance.name, instance)
      }
    }
    for (const subprocess of this.processes.values()) await this.startModule(subprocess)
  }

  public async startModule(subprocess: Subprocess) {
    try {
      await subprocess.run()
      this.client.Log.ok('Subprocess Manager', `Loaded [ ${subprocess.name} ]`)
    } catch (err) {
      this.client.Log.warn('Subprocess', err)
    }
  }
}
