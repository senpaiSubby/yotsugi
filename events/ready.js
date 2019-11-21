const { client } = require('../index')

const SubprocessManager = require('../core/SubprocessManager')

const Subprocesses = new SubprocessManager(client)

client.once('ready', async () => {
  const invite = await client.generateInvite([
    'MANAGE_MESSAGES',
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'MANAGE_MESSAGES',
    'MANAGE_ROLES'
  ])
  client.Log.info('Subby Invite', invite)
  client.Log.info('Client Ready', `Connected as ${client.user.username}`)
  client.user.setActivity(`on ${client.guilds.size} servers`)
  Subprocesses.loadModules('./core/subprocesses/')
})
