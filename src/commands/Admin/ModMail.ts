/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { NezukoClient } from 'core/NezukoClient'
import { Message, TextChannel } from 'discord.js'
import { NezukoMessage } from 'typings'

import { Command } from '../../core/base/Command'

export default class ModMail extends Command {
  constructor(client: NezukoClient) {
    super(client, {
      name: 'modmail',
      category: 'General',
      description: 'Send a message to the mods',
      usage: ['mm <message>'],
      aliases: ['mm'],
      guildOnly: true,
      args: true
    })
  }

  public async run(client: NezukoClient, msg: NezukoMessage, args: any[]) {
    // * ------------------ Setup --------------------

    const { Utils, db } = client
    const { warningMessage, embed } = Utils
    const { author, guild } = msg

    // * ------------------ Config --------------------

    const { prefix, modMailChannel } = db.server

    // * ------------------ Check Config --------------------

    const serverModMailChannel = guild.channels.get(modMailChannel) as TextChannel

    // * ------------------ Logic --------------------

    if (!modMailChannel) {
      return warningMessage(
        msg,
        `It appears that you don't have an Mod Mail channel set.
        \`${prefix}server set modMailChannel <channelID>\` to set one`
      )
    }

    msg.delete()
    const m = (await msg.reply('Message sent to the mods')) as Message
    m.delete(5000)

    return serverModMailChannel.send(
      embed(msg, 'yellow', 'check.png')
        .setTitle(`Mod Mail`)
        .setDescription(`${args.join(' ')}`)
        .setFooter(`From ${author.tag}`, author.avatarURL)
    )
  }
}
