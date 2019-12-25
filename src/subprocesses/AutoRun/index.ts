/*!
 * Coded by CallMeKory - https://github.com/callmekory
 */

import { NezukoClient } from 'structures/NezukoClient'
import { Subprocess } from '../../core/Subprocess'
import later from 'later'
import { manager } from '../../events/message'

export default class AutoRun extends Subprocess {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'AutoRun',
      description: 'Schedule commands to run at specified times',
      disabled: false
    })
  }

  public async run() {
    const { Log, generalConfig } = this.client
    const { ownerID } = this.client.config

    const db = await generalConfig.findOne({ where: { id: ownerID } })
    if (db) {
      const config = JSON.parse(db.dataValues.config)
      const { autorun } = config

      const runCommand = async (cmdName: string) => {
        const generalDB = await this.client.generalConfig.findOne({ where: { id: ownerID } })
        client.db.config = JSON.parse(generalDB.dataValues.config)

        const args = cmdName.split(' ')
        const cmd = args.shift()!.toLowerCase()
        const command = manager.findCommand(cmd)
        return manager.runCommand(this.client, command, null, args, true)
      }

      later.date.localTime()

      autorun.forEach((i) => {
        const { commands, time } = i
        const sched = later.parse.text(`at ${time}`)
        commands.forEach((c) => {
          const [enabled, cmd] = c
          if (enabled) {
            later.setInterval(async () => {
              Log.info('Auto Run', `Running [ ${time} ] command [ ${cmd} ]`)
              const response = await runCommand(cmd)
              Log.info('Auto Run', `[ ${cmd} ] => ${response} `)
            }, sched)
          }
        })
      })
    }
  }

  public client(client: any, command: any, arg2: null, args: string[], arg4: boolean) {
    throw new Error('Method not implemented.')
  }
}
