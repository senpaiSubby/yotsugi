const Subprocess = require('../../Subprocess')

class Template extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'Template',
      description: 'Template',
      disabled: true
    })
  }

  async run() {}
}

module.exports = Template
