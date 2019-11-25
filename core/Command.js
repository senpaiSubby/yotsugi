const config = require('../data/config')

module.exports = class Command {
  constructor(client, data = {}) {
    if (typeof data !== 'object') throw new TypeError('Client data parameter must be an object')
    this.client = client
    this.config = config
    this.name = data.name
    this.category = data.category || ''
    this.description = data.description
    this.aliases = data.aliases || []
    this.args = data.args || false
    this.webUI = data.webUI || false
    this.usage = data.usage || ''
    this.guildOnly = data.guildOnly || false
    this.ownerOnly = data.ownerOnly || false
    this.adminOnly = data.adminOnly || false
    this.permsNeeded = data.permsNeeded || []

    if (!this.name) throw new Error('Command Name is required')
    if (!this.description) throw new Error('Command Description is required')
    if (typeof this.name !== 'string') throw new TypeError('Command name must be a string')
    if (typeof this.description !== 'string')
      throw new TypeError('Command description must be a string')
    if (typeof this.category !== 'string') throw new TypeError('Command category must be a string')
    if (!(this.permsNeeded instanceof Array))
      throw new TypeError('Command permsNeeded must be an array of strings')
    if (this.permsNeeded.some((perm) => typeof perm !== 'string'))
      throw new TypeError('Command permsNeeded must be an array of strings')
    if (!(this.aliases instanceof Array))
      throw new TypeError('Command aliases must be an array of strings')
    if (this.aliases.some((alias) => typeof alias !== 'string'))
      throw new TypeError('Command aliases must be an array of strings')
    if (typeof this.guildOnly !== 'boolean')
      throw new TypeError('Command guildOnly property must be a boolean')
    if (typeof this.adminOnly !== 'boolean')
      throw new TypeError('Command adminOnly property must be a boolean')
    if (typeof this.args !== 'boolean')
      throw new TypeError('Command args property must be a boolean')
    if (typeof this.webUI !== 'boolean')
      throw new TypeError('Command webUI property must be a boolean')
    if (typeof this.ownerOnly !== 'boolean')
      throw new TypeError('Command adminOnly property must be a boolean')
  }

  run() {
    throw new Error('Missing Run Method')
  }
}
