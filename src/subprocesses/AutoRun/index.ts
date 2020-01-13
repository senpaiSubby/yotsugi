/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import later from 'later'

import { Subprocess } from '../../core/base/Subprocess'
import { generalConfig } from '../../core/database/database'
import { CommandManager } from '../../core/managers/CommandManager'
import { NezukoClient } from '../../core/NezukoClient'

export default class AutoRun extends Subprocess {
  public commandManager: CommandManager

  constructor(client: NezukoClient) {
    super(client, {
      name: 'AutoRun',
      description: 'Schedule commands to run at specified times',
      disabled: false
    })
  }

  public async run() {
    const { Log } = this.client
    const { ownerID } = this.client.config

    const db = await generalConfig(ownerID)

    if (db) {
      const config = JSON.parse(db.get('config') as string)
      const { autorun } = config

      const runCommand = async (cmdName: string) => {
        this.client.db.config = config

        const args = cmdName.split(' ')
        const cmd = args.shift().toLowerCase()
        const command = this.client.commandManager.findCommand(cmd)
        if (command) return this.client.commandManager.runCommand(this.client, command, null, args, true)
        return `No command [ ${cmdName} ]`
      }

      later.date.localTime()

      autorun.forEach((i: AutorunItem) => {
        const { commands, time } = i
        const sched = later.parse.text(`at ${time}`)

        commands.forEach((c) => {
          const { enabled, command } = c

          if (enabled) {
            later.setInterval(async () => {
              Log.info('Auto Run', `Running [ ${time} ] command [ ${command} ]`)
              const response = await runCommand(command)
              Log.info('Auto Run', `[ ${command} ] => [ ${response} ]`)
            }, sched)
          }
        })
      })
    }
  }
}
