const schedule = require('node-schedule')
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
    const { Log } = this.client
    const { runCommand } = this.client.Utils

    // every morning at 10am
    schedule.scheduleJob('0 10 * * *', async () => {
      // turn cheetos tank on
      const tankStatus = await runCommand('plug tank on')
      if (tankStatus === 'success') {
        Log.info('Turning cheetos tank on')
      } else if (tankStatus === 'failure') {
        Log.error('Failed to turn cheetos tank on')
      }
    })

    // every night at 8pm
    schedule.scheduleJob('0 20 * * *', async () => {
      // turn cheetos tank off
      const tankStatus = await runCommand('plug tank off')
      if (tankStatus === 'success') {
        Log.info('Turning cheetos tank off')
      } else if (tankStatus === 'failure') {
        Log.error('Failed to turn cheetos tank off')
      }
    })
  }
}

module.exports = ScheduledTasks
