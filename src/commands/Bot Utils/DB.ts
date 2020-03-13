/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Attachment, Message } from 'discord.js'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'
import { BotClient } from '../../core/BotClient'

export default class DB extends Command {
  constructor(client: BotClient) {
    super(client, {
      name: 'db',
      category: 'Bot Utils',
      description: 'Get/Set database configs',
      usage: ['config backup', 'config get', 'config get emby', 'config set emby host https://emby.url'],
      aliases: ['config'],
      ownerOnly: true,
      args: true
    })
  }

  public async run(client: BotClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, generalConfig, p } = client
    const { warningMessage, validOptions, standardMessage, chunkArray, embed } = Utils
    const { channel } = msg

    // * ------------------ Config --------------------

    const db = await generalConfig.findOne({
      where: { id: client.config.ownerID }
    })
    const { config } = client.db

    // * ------------------ Usage Logic --------------------

    switch (args[0]) {
      case 'get': {
        const key1 = args[1]
        if (!key1) {
          delete config.disabledCommands
          delete config.webUI
          delete config.routines
          delete config.shortcuts

          const e = embed(msg, 'green', 'settings.png')
            .setTitle('Database Config')
            .setDescription(`[ \`${p}config get <key>\` ] for more detailed info`)

          const splitArray = chunkArray(Object.keys(config).sort(), 7)
          splitArray.forEach((item) => {
            let text = ''
            item.forEach((i) => (text += `${i}\n`))
            e.addField(`\u200b`, text, true)
          })
          return channel.send(e)
        }
        if (key1 in config) {
          const keys = Object.keys(config[key1])
          const e = embed(msg, 'green', 'settings.png')
            .setTitle(`Database Config [ ${key1} ]`)
            .setDescription(`[ \`${p}config set ${key1} <option> <new value>\` ] to change`)

          keys.forEach((i) => {
            e.addField(`${i}`, `${config[key1][i]}`, true)
          })

          return channel.send(e)
        }
        return warningMessage(msg, `Option [ ${key1} ] doesnt exist`)
      }
      case 'set': {
        const keyToChange = args[1]
        const key1 = args[2]
        const val1 = args[3]
        if (keyToChange in config && key1 in config[keyToChange]) {
          config[keyToChange][key1] = val1
          await db.update({ config: JSON.stringify(config) })
          const m = (await standardMessage(
            msg,
            'green',
            `[ ${keyToChange} ${key1} ] changed to [ ${val1} ]`
          )) as Message
          return m.delete(10000)
        }
        return warningMessage(msg, `Option [ ${key1} ] doesnt exist`)
      }
      case 'backup': {
        const attachment = new Attachment(`${__dirname}/../../config/db.sqlite`)
        return channel.send(attachment)
      }
      default:
        return validOptions(msg, ['get', 'set', 'backup'])
    }
  }
}
