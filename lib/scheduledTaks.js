const schedule = require('node-schedule')
const fetch = require('node-fetch')
module.exports = async (client) => {
  const { apiPort, apiKey } = client.config.general

  /**
   * Semd bot commands to run over API server
   * @param {String} command command to run
   * @return {JSON} response from server
   */
  const runCommand = async (command) => {
    const postData = {
      apiKey: apiKey,
      command: command
    }
    const response = await fetch(`http://127.0.0.1:${apiPort}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })
    return response
  }

  //* every morning at 10am
  schedule.scheduleJob('0 10 * * *', async () => {
    //* turn cheetos tank on
    const status = await runCommand('plug tank on')
    if (status.status === 200) {
      console.log('Turning cheetos tank off')
    } else {
      console.log('Failed to turn cheetos tank on')
    }
  })

  //* every night at 8pm
  schedule.scheduleJob('0 20 * * *', async () => {
    //* turn cheetos tank off
    const status = await runCommand('plug tank off')
    if (status.status === 200) {
      console.log('Turning cheetos tank off')
    } else {
      console.log('Failed to turn cheetos tank off')
    }
  })
}
