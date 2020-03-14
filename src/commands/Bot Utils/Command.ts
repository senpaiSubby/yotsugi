/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { GeneralDBConfig, NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'
import { database } from '../../core/database/database'
import { Utils } from '../../core/Utils'

/**
 * Command to lock, unlock,disable and enable commands from being used in guilds
 */
export default class CMD extends Command {
  constructor(client: BotClient) {
    super(client, {
      args: true,
      category: 'Bot Utils',
      description: 'Lock, unlock, disable, enable commands',
      name: 'command',
      ownerOnly: true,
      usage: [
        'command lock [command name or usage]',
        'command unlock [command name or usage]',
        'command locked [shows locked commands]',
        'command disable [command]',
        'command enable [command]',
        'command disabled [show disabled commands]'
      ]
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { warningMessage, standardMessage, asyncForEach, embed, validOptions } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const db = await database.models.Configs.findOne({
      where: { id: client.config.ownerID }
    })
    const config = JSON.parse(db.get('config') as string) as GeneralDBConfig
    const { lockedCommands, disabledCommands } = config

    // Commands that are required and CANNOT be disabled
    const nonDisableable = ['command', 'cmd', 'help']

    // Task to be preformed
    const task = args.shift()

    // * ------------------ Logic --------------------

    /**
     * Checks if a command is marked as locked
     * @param command the command name to check for
     */
    const checkIfLocked = async (command: string) => {
      let isLocked = false

      // Check if command is marked as locked in config
      lockedCommands.forEach((i) => {
        if (command === i.command) isLocked = true
      })

      // Return if it is or not
      return isLocked
    }

    /**
     * Locks the specified command
     * @param command the command to lock
     */
    const lockCommand = async (command: string) => {
      const alreadyLocked = []
      const canBeLocked = []

      // Check if command is locked
      const isLocked = await checkIfLocked(command)

      // If command isn't locked then add command to canBeLocked array and
      // Update the locked command database
      if (!isLocked) {
        canBeLocked.push(command)
        lockedCommands.push({ command: args.join(' ') })
        await db.update({ config: JSON.stringify(config) })
      }
      // Else add command to alreadyLocked array
      else alreadyLocked.push(command)

      // If there are any already locked commands
      // Notify user that they cannot be locked again
      if (alreadyLocked.length) {
        return warningMessage(msg, `[ ${alreadyLocked} ] is already locked`)
      }

      // If there are commands that can be locked
      // Notify the user that there were locked
      if (canBeLocked.length) {
        return standardMessage(msg, 'green', `Locked [ ${canBeLocked} ]`)
      }
    }

    /**
     * Unlocks the specified command
     * @param command the command to unlock
     */
    const unlockCommand = async (command: string) => {
      const alreadyUnlocked = []
      const willUnlock = []

      // Check if command is locked
      const isLocked = await checkIfLocked(command)

      // If command already locked
      if (isLocked) {
        // Find index and remove command from locked status
        const index = lockedCommands.findIndex((i) => i.command === command)
        lockedCommands.splice(index, 1)
        // Update database
        await db.update({ config: JSON.stringify(config) })
        // Add command to willUnlock array
        willUnlock.push(command)
      }
      // Else add command to alreadyUnlocked array
      else alreadyUnlocked.push(command)

      // If any commands were already unlocked then
      // Notify user
      if (alreadyUnlocked.length) {
        return warningMessage(msg, `[ ${alreadyUnlocked} ] is not locked`)
      }

      // If any commands were able to be unlocked
      // Then notify user
      if (willUnlock.length) {
        return standardMessage(msg, 'green', `Unlocked [ ${willUnlock} ]`)
      }
    }

    /**
     * Lists locked commands
     */
    const listLocked = async () => {
      // Fetch all locked command names
      const commandList = lockedCommands.map((i) => i.command)

      // If there are locked commands then
      // Notify user of them
      if (commandList.length) {
        return channel.send(
          embed(msg, 'green')
            .setTitle('Locked Commands')
            .setDescription(`**- ${commandList.sort().join('\n- ')}**`)
        )
      }

      // If not then notify user that there are no currently locked commands
      return standardMessage(msg, 'green', `No commands are currently locked`)
    }

    /**
     * Checks if a command is disabled
     * @param command name of command to check
     */
    const checkIfDisabled = async (command: string) => {
      let isDisabled = false

      // Check if the command matches ant currenly locked commands
      disabledCommands.forEach((i) => {
        if (command === i.command || i.aliases.includes(command)) {
          isDisabled = true
        }
      })

      // Return if command is disabled or not
      return isDisabled
    }

    /**
     * Disables commands
     * @param commands list of command names to disable
     */
    const disableCommands = async (commands: string[]) => {
      const alreadyDisabled = []
      const willDisable = []
      const cannotDisable = []

      for (const command of commands) {
        // Find command from loaded bot commands
        const c = msg.context.findCommand(command)

        // If command exists
        if (c) {
          // Check if command is not restrcted from being disabled
          if (!nonDisableable.includes(command)) {
            // Check if command is currently disabled
            const isDisabled = await checkIfDisabled(command)

            // If command is not disabled
            if (isDisabled) {
              // Add to willDisable array
              willDisable.push(command)
              // Disable command
              disabledCommands.push({ command: c.name, aliases: c.aliases })
              // Update disabled command database
              await db.update({ config: JSON.stringify(config) })
            }
            // If command is already disabled add to alreadyDisabled array
            else alreadyDisabled.push(command)
          }
          // Is command is restricted from being disabled then
          // Add to cannotDisable array
          else cannotDisable.push(command)
        }
        // If no command or alias by target command name then notify user
        else return warningMessage(msg, `No command named [ ${command} ]`)

        // If commands in cannotDisable array then notify user
        if (cannotDisable.length) {
          await channel.send(
            embed(msg, 'red')
              .setTitle('The following commands CANNOT be disabled since they are required!')
              .setDescription(`**- ${cannotDisable.join('\n- ')}**`)
          )
        }

        // If commands in alreadyDisabled array then notify user
        if (alreadyDisabled.length) {
          await channel.send(
            embed(msg, 'yellow')
              .setTitle('The following commands are already disabled')
              .setDescription(`**- ${alreadyDisabled.join('\n- ')}**`)
          )
        }

        // If commands in willDisable array then notify user
        if (willDisable.length) {
          await channel.send(
            embed(msg, 'green')
              .setTitle('Disabled the Commands')
              .setDescription(`**- ${willDisable.join('\n- ')}**`)
          )
        }
      }
    }

    /**
     * Enabled commands
     * @param commands list of command names to enable
     */
    const enableCommands = async (commands: string[]) => {
      const alreadyEnabled = []
      const willEnable = []

      for (const i of commands) {
        // Find command in bot
        const cm = msg.context.findCommand(i)

        // If command exists
        if (cm) {
          // Check if command is currently disabled
          const isDisabled = await checkIfDisabled(i)

          // If command is disabled
          if (isDisabled) {
            // Add command to willEnable array
            willEnable.push(i)

            // Iterates over command name and aliases and remove command from disabled status
            await asyncForEach(disabledCommands, async (c, index) => {
              const { aliases, command } = c

              // If command name or alias remove command
              if (aliases.includes(i) || command === i) {
                disabledCommands.splice(index, 1)
              }

              // Update database
              await db.update({ config: JSON.stringify(config) })
            })
          }
          // If command is not disabled all to alreadyEnabled array
          else {
            alreadyEnabled.push(i)
          }
        }
        // If not command by name then notify user
        else {
          return warningMessage(msg, `No command named [ ${i} ]`)
        }
      }

      // If any commands were already enabled notify user
      if (alreadyEnabled.length) {
        await channel.send(
          embed(msg, 'yellow')
            .setTitle('The following commands are already enabled')
            .setDescription(`**- ${alreadyEnabled.join('\n- ')}**`)
        )
      }

      // If any commands were able to be enabled then notify user
      if (willEnable.length) {
        await channel.send(
          embed(msg, 'green')
            .setTitle('Enabled the Commands')
            .setDescription(`**- ${willEnable.join('\n- ')}**`)
        )
      }
    }

    /**
     * List the currently disabled commands
     */
    const listDisabled = async () => {
      const commandList = []
      disabledCommands.forEach((i) => commandList.push(i.command))
      if (commandList.length) {
        return channel.send(
          embed(msg, 'green')
            .setTitle('Disabled Commands')
            .setDescription(`**- ${commandList.sort().join('\n- ')}**`)
        )
      }

      return standardMessage(msg, 'green', `No commands are disabled`)
    }
    // * ------------------ Usage Logic --------------------

    switch (task) {
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
