const { scheduleJob } = require('node-schedule')
const Subprocess = require('../../Subprocess')

class ScheduledTasks extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'Scheduled Tasks',
      description: 'Scheduled Tasks',
      disabled: false
    })
  }

  async run() {
    const { runCommand } = this.client.Utils

    // every morning at 10am
    scheduleJob('0 10 * * *', async () => {
      // turn cheetos tank on
      await runCommand('plug tank on')
    })

    // every night at 8pm
    scheduleJob('0 20 * * *', async () => {
      // turn cheetos tank off
      await runCommand('plug tank off')
    })
  }
}

module.exports = ScheduledTasks
