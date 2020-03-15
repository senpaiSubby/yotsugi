/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import later from 'later'

import { GuildChannel, Message, TextChannel } from 'discord.js'
import { NezukoMessage } from 'typings'
import { Subprocess } from '../../core/base/Subprocess'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Log } from '../../core/Logger'
import { CommandManager } from '../../core/managers/CommandManager'
import { Utils } from '../../core/Utils'

// TODO add autorun channel to config
export default class AutoRun extends Subprocess {
  public commandManager: CommandManager

  constructor() {
    super({
      name: 'AutoRun',
      description: 'Schedule commands to run at specified times',
      disabled: false
    })
  }

  public async run(client: BotClient) {
    const { ownerID } = client.config

    const db = await database.models.Configs.findOne({ where: { id: ownerID } })

    if (db) {
      const config = JSON.parse(db.get('config') as string)
      const { tasks, channelID } = config.autorun

      if (!channelID) {
        return Log.warn('Autorun', 'No autorun channel is set in config')
      }

      const channel = client.channels.get(channelID) as TextChannel
      let message: NezukoMessage

      const runCommand = async (cmdName: string) => {
        const args = cmdName.split(' ')
        const cmd = args.shift().toLowerCase()
        const command = client.commandManager.findCommand(cmd)

        message = (await channel.send('INCOMING')) as NezukoMessage
        await message.delete()

        if (command) {
          return client.commandManager.runCommand(client, command, message, args)
        }
        return `No command [ ${cmdName} ]`
      }

      later.date.localTime()

      tasks.forEach((i: AutorunItem) => {
        const { commands, time } = i
        const sched = later.parse.text(`at ${time}`)

        commands.forEach((c) => {
          const { enabled, command } = c

          if (enabled) {
            later.setInterval(async () => {
              Log.info('Auto Run', `Running [ ${time} ] command [ ${command} ]`)
              const response = await runCommand(command)
              await channel.send(
                Utils.standardMessage(message, 'green', `Running [ ${time} ] autorun command [ ${command} ]`)
              )

              Log.info('Auto Run', `[ ${command} ] => [ ${response} ]`)
            }, sched)
          }
        })
      })
    }
  }
}
