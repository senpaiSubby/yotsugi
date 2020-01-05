/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Command } from '../../core/Command'
import { Message } from 'discord.js'
import { NezukoClient } from '../../NezukoClient'
import { NezukoMessage } from 'typings'

export default class CMD extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'command',
      category: 'Owner',
      description: 'Lock | Unlock | Disable | Enable commands',
      usage: [
        'cmd lock <command name or usage>',
        'cmd unlock <command name or usage>',
        'cmd locked <shows locked commands>',
        'cmd disable <command>',
        'cmd enable <command>',
        'cmd disabled <show disabled commands>'
      ],
      aliases: ['cmd'],
      args: true,
      ownerOnly: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, generalConfig } = client
    const { warningMessage, standardMessage, asyncForEach, embed, validOptions } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const db = await generalConfig.findOne({ where: { id: client.config.ownerID } })
    const { config } = client.db
    const { lockedCommands, disabledCommands } = config
    const nonDisableable = ['command', 'cmd', 'help']
    const cmd = args[0]
    args.shift()

    // * ------------------ Logic --------------------

    const checkIfLocked = async (command: string) => {
      let isDisabled = false
      lockedCommands.forEach((i) => {
        if (command === i.command) isDisabled = true
      })
      if (isDisabled) return true
      return false
    }

    const lockCommand = async (command) => {
      const alreadyLocked = []
      const willLock = []

      const isDisabled = await checkIfLocked(command)

      if (isDisabled) alreadyLocked.push(command)

      if (!isDisabled) {
        willLock.push(command)
        lockedCommands.push({ command: args.join(' ') })
        await db.update({ config: JSON.stringify(config) })
      }

      if (alreadyLocked.length) {
        return warningMessage(msg, `[ ${alreadyLocked} ] is already locked`)
      }

      if (willLock.length) {
        return standardMessage(msg, `Locked [ ${willLock} ]`)
      }
    }

    const unlockCommand = async (command) => {
      const alreadyUnlocked = []
      const willUnlock = []

      const isDisabled = await checkIfLocked(command)

      if (!isDisabled) alreadyUnlocked.push(command)

      if (isDisabled) {
        const index = lockedCommands.findIndex((i) => i.command === command)
        lockedCommands.splice(index, 1)
        await db.update({ config: JSON.stringify(config) })
        willUnlock.push(command)
      }

      if (alreadyUnlocked.length) {
        return warningMessage(msg, `[ ${alreadyUnlocked} ] is not locked`)
      }

      if (willUnlock.length) {
        return standardMessage(msg, `Unlocked [ ${willUnlock} ]`)
      }
    }

    const listLocked = async () => {
      const commandList = []
      lockedCommands.forEach((i) => commandList.push(i.command))
      if (commandList.length) {
        return channel.send(
          embed('green')
            .setTitle('Locked Commands')
            .setDescription(`**- ${commandList.sort().join('\n- ')}**`)
        )
      }

      return standardMessage(msg, `No commands are currently locked`)
    }

    const checkIfDisabled = async (command) => {
      let isDisabled = false
      disabledCommands.forEach((i) => {
        if (command === i.command || i.aliases.includes(command)) isDisabled = true
      })
      if (isDisabled) return true
      return false
    }

    const disableCommands = async (commands) => {
      const alreadyDisabled = []
      const willDisable = []
      const cannotDisable = []

      await asyncForEach(commands, async (i) => {
        const c = msg.context.findCommand(i)
        if (!c) return warningMessage(msg, `No command named [ ${i} ]`)
        if (!nonDisableable.includes(i)) {
          const isDisabled = await checkIfDisabled(i)

          if (isDisabled) alreadyDisabled.push(i)

          if (!isDisabled) {
            willDisable.push(i)
            disabledCommands.push({ command: c.name, aliases: c.aliases })
            await db.update({ config: JSON.stringify(config) })
          }
        }
        if (nonDisableable.includes(i)) cannotDisable.push(i)
      })

      if (cannotDisable.length) {
        const m = (await channel.send(
          embed('red')
            .setTitle('The following commands CANNOT be disabled since they are required!')
            .setDescription(`**- ${cannotDisable.join('\n- ')}**`)
        )) as Message
        m.delete(20000)
      }

      if (alreadyDisabled.length) {
        const m = (await channel.send(
          embed('yellow')
            .setTitle('The following commands are already disabled')
            .setDescription(`**- ${alreadyDisabled.join('\n- ')}**`)
        )) as Message
        m.delete(20000)
      }

      if (willDisable.length) {
        await channel.send(
          embed('green')
            .setTitle('Disabled the Commands')
            .setDescription(`**- ${willDisable.join('\n- ')}**`)
        )
      }
    }

    const enableCommands = async (commands) => {
      const alreadyEnabled = []
      const willEnable = []

      await asyncForEach(commands, async (i) => {
        const cm = msg.context.findCommand(i)
        if (!cm) return warningMessage(msg, `No command named [ ${i} ]`)

        const isDisabled = await checkIfDisabled(i)

        if (!isDisabled) alreadyEnabled.push(i)

        if (isDisabled) {
          willEnable.push(i)
          await asyncForEach(disabledCommands, async (c, index) => {
            const { aliases, command } = c

            if (aliases.includes(i) || command === i) disabledCommands.splice(index, 1)

            await db.update({ config: JSON.stringify(config) })
          })
        }
      })

      if (alreadyEnabled.length) {
        const m = (await channel.send(
          embed('yellow')
            .setTitle('The following commands are already enabled')
            .setDescription(`**- ${alreadyEnabled.join('\n- ')}**`)
        )) as Message
        m.delete(20000)
      }

      if (willEnable.length) {
        await channel.send(
          embed('green')
            .setTitle('Enabled the Commands')
            .setDescription(`**- ${willEnable.join('\n- ')}**`)
        )
      }
    }

    const listDisabled = async () => {
      const commandList = []
      disabledCommands.forEach((i) => commandList.push(i.command))
      if (commandList.length) {
        return channel.send(
          embed('green')
            .setTitle('Disabled Commands')
            .setDescription(`**- ${commandList.sort().join('\n- ')}**`)
        )
      }

      return standardMessage(msg, `No commands are disabled`)
    }
    // * ------------------ Usage Logic --------------------

    switch (cmd) {
      case 'enable': {
        switch (args[0]) {
          case 'all': {
            const commandList = msg.context.commands.map((i) => i.name)
            return enableCommands(commandList)
          }
          default:
            return enableCommands(args)
        }
      }
      case 'disable': {
        switch (args[0]) {
          case 'all': {
            const commandList = msg.context.commands.map((i) => i.name)
            return disableCommands(commandList)
          }
          default:
            return disableCommands(args)
        }
      }
      case 'disabled':
        return listDisabled()
      case 'lock':
        return lockCommand(args.join(' '))
      case 'unlock':
        return unlockCommand(args.join(' '))
      case 'locked':
        return listLocked()
      default:
        return validOptions(msg, ['disable', 'enable', 'disabled', 'lock', 'unlock', 'locked'])
    }
  }
}
