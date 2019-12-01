module.exports = class Subprocess {
  constructor(client, data = {}) {
    if (typeof data !== 'object') throw new Error('Subprocess data parameter must be an object')
    this.client = client
    this.name = data.name
    this.description = data.description
    this.disabled = data.disabled || false

    if (!this.name) throw new Error('Subprocess Name is required')
    if (!this.description) throw new Error('Subprocess Description is required')
    if (typeof this.name !== 'string') throw new TypeError('Subprocess name must be a string')
    if (typeof this.description !== 'string') {
      throw new TypeError('Subprocess description must be a string')
    }
    if (typeof this.disabled !== 'boolean') {
      throw new TypeError('Subprocess disabled property must be a boolean')
    }
  }

  run() {
    throw new Error('Missing Run Method')
  }
}
