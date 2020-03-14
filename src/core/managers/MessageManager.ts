/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */
import { Collection, Guild, MessageAttachment } from 'discord.js'
import { basename, extname } from 'path'
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
   * Attachments are parsed based on file extension. For example,
   * .torrent files will be added into transmissions download queue
   */
  public async log() {
    // If message contains attachments, send them to be parsed
    if (this.msg.attachments) this.attachmentParser(this.msg.attachments)
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
   * Parses attachments
   * @param attachments
   */
  private attachmentParser(attachments: Collection<string, MessageAttachment>) {
    attachments.forEach(async (a) => {
      const { url } = a

      // Parse file name from url
      const fileName = basename(url)

      // Command with params to be ran based on file extension
      let cmd: string

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
    })
  }
}
