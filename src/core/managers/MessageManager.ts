/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Collection, Guild, MessageAttachment } from 'discord.js'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import fetch from 'node-fetch'
import { basename, dirname, extname, join } from 'path'
import torrent2magnet from 'torrent2magnet'
import { NezukoMessage } from 'typings'

import { BotClient } from '../BotClient'

/**
 * Message manager logs and parses attachments sent in guilds and dm's.
 * Attachments are saved into the respective guilds log directory.
 * Attachments are parsed based on file extension. For example,
 * .torrent files will be added into transmissions download queue
 */
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
   * Logs and parses attachments sent in guilds and dm's.
   * Attachments are saved into the respective guilds log directory.
   * Attachments are parsed based on file extension. For example,
   * .torrent files will be added into transmissions download queue
   */
  public async log() {
    // If message contains attachments, send them to be parsed
    if (this.msg.attachments) this.handleMessage(this.msg.attachments)
  }

  /**
   * Runs the specified bot command with params
   * @param cmdString bot command with params
   */
  private async runCommand(cmdString: string) {
    // Parse command name from command string
    const commandName = cmdString.split(' ').shift()

    // Find command instance
    const cmd = this.msg.context.findCommand(commandName)

    // Parse arguments from command string
    const args = cmdString.split(' ').slice(1)

    // If command return and run command
    if (cmd) {
      return this.msg.context.runCommand(this.client, cmd, this.msg, args)
    }
  }

  /**
   * Handles tasks to be performed for specified file extensions
   * @param url
   */
  private async attachmentParser(url: string) {
    // Parse file name from url
    const fileName = basename(url)

    // Command with params to be ran based on file extension
    let cmd: string | null

    // Parse uploaded files based of file extension
    switch (extname(fileName)) {
      // Add uploaded torrent files to Transmissions download queue
      case '.torrent':
        cmd = `tor add ${await torrent2magnet(url)}`
        break
      case '.nzb': {
        // TODO add nzb uploading
        break
      }
      // If no matches set cmd to null
      default:
        cmd = null
    }

    // If cmd string then run command
    if (cmd) return this.runCommand(cmd)
  }

  /**
   * Parses attachments. Saves a copy of each attachment sent in guilds and bot DM's.
   * @param attachments
   */
  private handleMessage(attachments: Collection<string, MessageAttachment>) {
    attachments.forEach(async (a) => {
      const { url } = a
      await this.attachmentParser(url)

      try {
        const name = basename(url)
        const dir = join(
          `${__dirname}/../../../logs/attachments/${this.guild.id}/${name}`
        )

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
