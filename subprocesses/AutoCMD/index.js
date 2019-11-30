const later = require('later')
const Subprocess = require('../../core/Subprocess')
const { Manager } = require('../../events/message')

module.exports = class AutoCMD extends Subprocess {
  constructor(client) {
    super(client, {
      name: 'AutoCMD',
      description: 'Schedule commands to run at specified times',
      disabled: false
    })
  }

  async run() {
    const { client } = this
    const { Log, generalConfig } = client
    const { ownerID } = client.config

    const db = await generalConfig.findOne({ where: { id: ownerID } })
    if (db) {
      const config = JSON.parse(db.dataValues.config)
      const { autocmd } = config

      const runCommand = async (cmdName) => {
        const generalDB = await client.generalConfig.findOne({ where: { id: ownerID } })
        client.db.config = JSON.parse(generalDB.dataValues.config)

        const args = cmdName.split(' ')
        const cmd = args.shift().toLowerCase()
        const command = Manager.findCommand(cmd)
        return Manager.runCommand(this.client, command, null, args, true)
      }

      later.date.localTime()

      autocmd.forEach((i) => {
        const { commands, time } = i
        const sched = later.parse.text(`at ${time}`)
        commands.forEach((c) => {
          const [enabled, cmd] = c
          if (enabled) {
            later.setInterval(async () => {
              Log.info('AutoCMD', `Running [ ${time} ] auto command [ ${cmd} ]`)
              const response = await runCommand(cmd)
              Log.info('AutoCMD', `[ ${cmd} ] => ${response} `)
            }, sched)
          }
        })
      })
    }
  }
}
