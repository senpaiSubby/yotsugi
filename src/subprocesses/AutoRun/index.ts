/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { CommandManager } from '../../core/managers/CommandManager'
import { NezukoClient } from '../../NezukoClient'
import { Subprocess } from '../../core/Subprocess'
import database from '../../core/database'
import later from 'later'

export default class AutoRun extends Subprocess {
  public commandManager: CommandManager

  constructor(client: NezukoClient) {
    super(client, {
      name: 'AutoRun',
      description: 'Schedule commands to run at specified times',
      disabled: false
    })

    this.commandManager = client.commandManager
  }

  public async run() {
    const { Log } = this.client
    const { ownerID } = this.client.config
    const { GeneralConfig } = database.models

    const db = await GeneralConfig.findOne({ where: { id: ownerID } })

    if (db) {
      const config = JSON.parse(db.get('config') as string)
      const { autorun } = config

      const runCommand = async (cmdName: string) => {
        this.client.db.config = config

        const args = cmdName.split(' ')
        const cmd = args.shift().toLowerCase()
        const command = this.commandManager.findCommand(cmd)
        return this.commandManager.runCommand(this.client, command, null, args, true)
      }

      later.date.localTime()

      autorun.forEach((i: AutorunItem) => {
        const { commands, time } = i
        const sched = later.parse.text(`at ${time}`)
        commands.forEach((c) => {
          const enabled = c[0] as boolean
          const cmd = c[1] as string

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
}
