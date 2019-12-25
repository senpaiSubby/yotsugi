import { Command } from '../../core/Command'

export default  class Reload extends Command {
  constructor(client) {
    super(client, {
      name: 'bot',
      category: 'Owner',
      description: 'Bot Commands',
      ownerOnly: true,
      usage: [
        'bot reload <command>',
        'bot restart',
        'bot avatar <new avatar url>',
        'bot status <new status>',
        'bot name <new name>'
      ]
    })
  }

  async run(client, msg, args) {
    // * ------------------ Setup --------------------

    const { warningMessage, standardMessage, embed } = client.Utils
    const { context, channel } = msg

    const option = args[0]
    args.shift()

    // * ------------------ Logic --------------------

    switch (option) {
      case 'reload': {
        const module = args[1]

        if (!module) {
          const msg1 = await standardMessage(msg, `Reloading all modules..`)
          await context.reloadCommands()
          return msg1.edit(standardMessage(msg, `Reloading all modules.. done!`))
        }

        const run = await context.reloadCommand(module)

        if (run) return warningMessage(msg, `Reloaded ${module}`)

        return warningMessage(msg, `Module [ ${module} ] doesn't exist!`)
      }
      case 'restart': {
        let count = 10

        const m = await channel.send(
          embed('yellow').setDescription(`Restarting in ${count} seconds..`)
        )
        const interval = setInterval(async () => {
          if (count === 0) {
            await m.edit(embed('yellow').setDescription(`Restarting..`))
            clearInterval(interval)
            return process.exit()
          }
          count--
          await m.edit(embed('yellow').setDescription(`Restarting in ${count} seconds..`))
        }, 1000)
        break
      }
      case 'avatar': {
        await client.user.setAvatar(args[0])
        return standardMessage(msg, `[ ${client.user.username} ] avatar updated`)
      }
      case 'status': {
        const gameName = args.join(' ')

        await client.user.setActivity(gameName)
        return standardMessage(msg, `[ ${client.user.username} ] status set to [ ${gameName} ]`)
      }
      case 'name': {
        const username = args.join(' ')
        const u = await client.user.setUsername(username)
        return standardMessage(msg, `[ ${client.user.username} ] name changed to [ ${u.username} ]`)
      }
    }
  }
}
