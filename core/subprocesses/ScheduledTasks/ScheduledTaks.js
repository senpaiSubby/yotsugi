const schedule = require('node-schedule')

class ScheduledTasks extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'Scheduled Tasks',
      description: 'Scheduled Tasks',
      disabled: false
    })
  }

  async run() {
    const { logger } = this.client
    const { runCommand } = this.client.utils

    // every morning at 10am
    schedule.scheduleJob('0 10 * * *', async () => {
      // turn cheetos tank on
      const tankStatus = await runCommand(this.client, 'plug tank on')
      if (tankStatus === 'success') {
        logger.info('Turning cheetos tank on')
      } else if (tankStatus === 'failure') {
        logger.warn('Failed to turn cheetos tank on')
      }
    })

    // every night at 8pm
    schedule.scheduleJob('0 20 * * *', async () => {
      // turn cheetos tank off
      const tankStatus = await runCommand(this.client, 'plug tank off')
      if (tankStatus === 'success') {
        logger.info('Turning cheetos tank off')
      } else if (tankStatus === 'failure') {
        logger.warn('Failed to turn cheetos tank off')
      }
    })
  }
}

module.exports = ScheduledTasks
