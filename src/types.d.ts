import { Message } from 'discord.js'
import { CommandManager } from './core/CommandManager'
import Utils from 'core/Utils'

interface COLORS {
  [key: string]: string
}

interface NezukoDB {
  Utils?: Utils
  server?: any
  config?: any
}

interface NezukoMessage extends Message {
  command?: string
  context?: CommandManager
  p?: string
}

interface ExecAsync {
  code: number
  stdout: string
  stderr: string
}
