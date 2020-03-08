/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Collection, Guild, MessageAttachment } from 'discord.js'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import fetch from 'node-fetch'
import { dirname } from 'path'
import torrent2magnet from 'torrent2magnet'
import { NezukoMessage } from 'typings'

import { BotClient } from '../BotClient'

export class MessageManager {
  public client: BotClient
  public msg: NezukoMessage
  public context: any
  public guild: Guild

  constructor(client: BotClient, msg: NezukoMessage) {
    this.client = client
    this.msg = msg
    this.context = msg.context
    this.guild = msg.guild
  }

  /**
   * Logs message and attachments if any
   */
  public async log() {
    const { content, guild, author, channel, createdAt, attachments } = this.msg
    const { id, tag, username } = author
    const { serverConfig, config } = this.client
    const { ownerID } = config

    // Check if msg contains attachments

    if (attachments) this.handleAttachments(attachments)

    // Log every msg inside of guilds
    if (channel.type === 'text') {
      const db = await serverConfig.findOne({ where: { id: guild.id } })
      if (db) {
        const messages = JSON.parse(db.dataValues.messages)

        if (!messages.channels[channel.id]) messages.channels[channel.id] = []

        messages.channels[channel.id].push({
          id,
          createdAt,
          content,
          username: tag
        })
        await db.update({ messages: JSON.stringify(messages) })
      }
    }

    // Log every msg inside of DM's
    if (this.msg.channel.type === 'dm') {
      if (id === ownerID) return

      const db = await serverConfig.findOne({ where: { ownerID } })
      if (db) {
        const messages = JSON.parse(db.dataValues.messages)

        if (!messages.dm[id]) messages.dm[id] = []

        messages.dm[id].push({ username, id, createdAt, content })
        await db.update({ messages: JSON.stringify(messages) })
      }
    }
  }

  public async runCommand(cmdString: string) {
    const commandName = cmdString.split(' ').shift()

    const cmd = this.context.findCommand(commandName)
    const args = cmdString.split(' ').slice(1)
    if (cmd) return this.context.runCommand(this.client, cmd, this.msg, args)
  }

  public async attachmentParser(url: string) {
    const fileName = url.split('/').pop() as string
    const extension = fileName.split('.').pop()

    let cmd: string | null = null

    if (extension === 'torrent') cmd = `tor add ${await torrent2magnet(url)}`

    if (cmd) return this.runCommand(cmd)
  }

  public handleAttachments(attachments: Collection<string, MessageAttachment>) {
    attachments.forEach(async (a) => {
      const { url } = a
      await this.attachmentParser(url)

      try {
        const name = url.split('/').pop()
        const dir = `${__dirname}/../../../logs/attachments/${this.guild.id}/${name}`

        // Check if dir exists and create if not
        if (!existsSync(dirname(dir))) {
          mkdirSync(dirname(dir), { recursive: true })
        }

        const res = await fetch(url)
        const fileStream = createWriteStream(dir)

        await new Promise((resolve, reject) => {
          res.body.pipe(fileStream)
          res.body.on('error', (err) => reject(err))
          fileStream.on('finish', () => resolve())
        })
      } catch (error) {
        this.client.Log.warn(
          'Attachment Handler',
          `Failed to handle attachment`
        )
      }
    })
  }
}
