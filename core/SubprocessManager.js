const fs = require('fs')
const path = require('path')
const { Client } = require('discord.js')
const Enmap = require('enmap')

module.exports = class SubprocessManager {
  constructor(client) {
    this.client = client
    this.processes = new Enmap()

    if (!this.client || !(this.client instanceof Client)) {
      throw new Error('Discord Client is required')
    }
  }

  loadModules(dir) {
    const subprocesses = fs.readdirSync(dir)

    subprocesses.forEach((item) => {
      const location = path.join(__dirname, '../', dir, item, 'index.js')
      if (!fs.existsSync(location)) return

      const Process = require(location)
      const instance = new Process(this.client)
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

  startModule(subprocess) {
    try {
      subprocess.run()
    } catch (err) {
      this.client.Log.error('Subprocess', err)
    }
  }
}
