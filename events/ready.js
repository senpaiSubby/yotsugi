const { client } = require('../subbyBot')
const apiServer = require('../lib/apiServer')
const scheduledTasks = require('../lib/scheduledTaks')
const chalk = require('chalk')

client.on('ready', async () => {
  const { username } = client.config.general
  //* log that bot is ready
  console.log(chalk.green(`> ${chalk.yellow(client.user.username)}'s lazers ready to fire.`))

  //* set bot username
  if (client.user.username !== username) {
    client.user.setUsername(username)
    console.log(chalk.white(`Username changed to ${chalk.yellow(username)}`))
  }

  //* set bot activity status
  client.user.setActivity('Lewd anime. ;)', {
    type: 'watching'
  })

  //* start API server
  await apiServer(client)

  //* start scheduled tasks
  await scheduledTasks(client)
  console.log('\n')
})
