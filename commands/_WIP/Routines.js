const Command = require('../../core/Command')
const { Manager } = require('../../index')

class Routines extends Command {
  constructor(client) {
    super(client, {
      name: 'routine',
      category: 'Smart Home',
      description: 'Routines like good morning or goodnight',
      usage: `routine morning | routine sleep`,
      ownerOnly: true,
      webUI: true,
      args: true
    })
  }

  async run(client, msg, args, api) {
    const { Log } = client

    const routine = args[0]
    // command setup
    let commands
    switch (routine) {
      case 'on':
        commands = [
          ['say', 'Routine on activated'],
          ['avr', 'on'],
          ['pc', 'gaara on'],
          ['pc', 'thinkboi on'],
          ['lamp', ' desk on']
        ]
        break
      case 'off':
        commands = [
          ['say', 'Routine off activated'],
          ['avr', 'off'],
          ['pc', 'gaara off'],
          ['pc', 'thinkboi off'],
          ['lamp', ' desk off']
        ]
        break
      default:
        return
    }
    // .setFooter(`Requested by: ${author.username}`, author.avatarURL)
    try {
      for (const item of commands) {
        const params = item[1].trim().split(' ')
        console.log(item[0])

        const cmd = Manager.findCommand(item[0])
        try {
          if (api) {
            await Manager.runCommand(this.client, cmd, null, args, true)
          }
          await Manager.runCommand(this.client, cmd, msg, args)
        } catch (err) {
          console.log(`${item[0]} ${params} ${err}`)
        }
      }
      return 'success'
    } catch (error) {
      Log.warn(error)
      return 'failure'
    }
  }
}
module.exports = Routines
