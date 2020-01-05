/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import path, { join } from 'path'

import Enmap from 'enmap'
import { NezukoClient } from '../../NezukoClient'
import { Subprocess } from '../Subprocess'
import fs from 'fs'

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
        }

        this.processes.set(instance.name, instance)
      }
    }
    for (const subprocess of this.processes.values()) {
      this.startModule(subprocess)
    }
  }

  public startModule(subprocess: Subprocess) {
    try {
      subprocess.run()
      this.client.Log.ok('Subprocess Manager', `Loaded [ ${subprocess.name} ]`)
    } catch (err) {
      this.client.Log.warn('Subprocess', err)
    }
  }
}
