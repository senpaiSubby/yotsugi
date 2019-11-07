const schedule = require('node-schedule')

/**
 * Runs specified tasks at set intervals in cron formatting.
 * @param {*} client discord.js client object
 */
const scheduledTasks = async (client) => {
  const { logger } = client
  const { runCommand } = client.utils

  //* every morning at 10am
  schedule.scheduleJob('0 10 * * *', async () => {
    //* turn cheetos tank on
    const tankStatus = await runCommand(client, 'plug tank on')
    if (tankStatus === 'success') {
      logger.info('Turning cheetos tank on')
    } else if (tankStatus === 'failure') {
      logger.warn('Failed to turn cheetos tank on')
    }
  })

  //* every night at 8pm
  schedule.scheduleJob('0 20 * * *', async () => {
    //* turn cheetos tank off
    const tankStatus = await runCommand(client, 'plug tank off')
    if (tankStatus === 'success') {
      logger.info('Turning cheetos tank off')
    } else if (tankStatus === 'failure') {
      logger.warn('Failed to turn cheetos tank off')
    }
  })
}

module.exports = scheduledTasks
