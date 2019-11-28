const { cpu } = require('node-os-utils')
const si = require('systeminformation')
const { hostname, type, arch, release } = require('os')
const Command = require('../../core/Command')

module.exports = class SystemInfo extends Command {
  constructor(client) {
    super(client, {
      name: 'system',
      category: 'Utils',
      description: 'Live system stats',
      usage: ['si <interval in seconds>'],
      args: true,
      aliases: ['si']
    })
  }

  async run(client, msg, args, api) {
    // * ------------------ Setup --------------------
    const { bytesToSize, embed } = client.Utils
    const { channel, author } = msg
    const { round } = Math
    // * ------------------ Config --------------------
    // * ------------------ Check Config --------------------

    // * ------------------ Logic --------------------

    const cpuInfo = async () => {
      const coreCount = cpu.count()
      const cpuPercent = round(await cpu.usage(), 2)
      let loadAverage = ''
      cpu.loadavg().forEach((i) => (loadAverage += `${round(i)}% `))
      return { cores: coreCount, percentage: cpuPercent, load: loadAverage.trim() }
    }

    const ramInfo = async () => {
      const ram = await si.mem()
      return {
        total: bytesToSize(ram.total),
        used: bytesToSize(ram.used),
        free: bytesToSize(ram.free)
      }
    }

    // * ------------------ Usage Logic --------------------

    if (api) {
      return {
        cpu: await cpuInfo(),
        ram: await ramInfo()
      }
    }

    const ms = await channel.send(embed(msg).setDescription('**:timer: Loading system stats..**'))
    await ms.react('🛑')
    const interval = setInterval(async () => {
      const cpuStats = await cpuInfo()
      const ramStats = await ramInfo()
      const { cores, percentage, load } = cpuStats
      const { total, free, used } = ramStats

      await ms.edit(
        embed(msg)
          .setTitle(':computer: Live System Stats')
          .addField('Host', `**[${hostname()}] ${type()} ${arch()} ${release()}**`)
          .addField('CPU Cores', cores, true)
          .addField('CPU Usage', percentage, true)
          .addField('CPU Load', load, true)
          .addField('RAM Total', total, true)
          .addField('RAM Free', free, true)
          .addField('RAM Used', used, true)
      )
    }, args[0] * 1000)

    const collected = await ms.awaitReactions(
      (reaction, user) => ['🛑'].includes(reaction.emoji.name) && user.id === author.id,
      { max: 1 }
    )

    const reaction = collected.first()
    if (reaction) {
      if (reaction.emoji.name === '🛑') {
        clearInterval(interval)
        return ms.clearReactions()
      }
    }
    console.log('FUCK')
  }
}
