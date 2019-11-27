const config = require('../data/config')

module.exports = class Subprocess {
  constructor(client, data = {}) {
    if (typeof data !== 'object') throw new Error('Subprocess data parameter must be an object')

    this.client = client
    this.config = config

    this.name = data.name
    this.description = data.description
    this.disabled = data.disabled || false
    this.config = data.config || null

    if (!this.name) throw new Error('Subprocess Name is required')
    if (!this.description) throw new Error('Subprocess Description is required')
    if (typeof this.name !== 'string') throw new TypeError('Subprocess name must be a string')
    if (typeof this.description !== 'string') {
      throw new TypeError('Subprocess description must be a string')
    }
    if (typeof this.disabled !== 'boolean') {
      throw new TypeError('Subprocess disabled property must be a boolean')
    }

    if (this.config && !config.hasOwnProperty(this.config)) {
      throw new Error('Subprocess Config Object was not found in Config File')
    }

    this.config = config[this.config]
  }

  run() {
    throw new Error('Missing Run Method')
  }
}
