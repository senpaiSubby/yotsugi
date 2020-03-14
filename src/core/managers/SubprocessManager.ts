/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import Enmap from 'enmap'
import fs from 'fs'
import path, { join } from 'path'

import { Subprocess } from '../base/Subprocess'
import { BotClient } from '../BotClient'
import { Log } from '../Logger'

// tslint:disable: completed-docs

export class SubprocessManager {
  public client: BotClient
  public processes: any
  public loadedModules: string[]

  constructor(client: BotClient) {
    this.client = client

    if (!this.client || !(this.client instanceof BotClient)) {
      throw new Error('Discord Client is required')
    }

    this.processes = new Enmap()
    this.loadedModules = []
    this.loadModules()
  }

  public loadModules(dir = join(__dirname, '..', '..', 'subprocesses')) {
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
        } else {
          this.processes.set(instance.name, instance)
          this.loadedModules.push(instance.name)
        }
      }
    }
    for (const subprocess of this.processes.values()) {
      this.startModule(subprocess)
    }
    Log.ok('Subprocess Manager', `Loaded [ ${this.loadedModules.join(' | ')} ]`)
  }

  public async startModule(subprocess: Subprocess) {
    try {
      await subprocess.run()
      this.loadedModules.push(subprocess.name)
    } catch (err) {
      Log.warn('Subprocess', err)
    }
  }
}
