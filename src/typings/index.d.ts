/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

import { Message } from 'discord.js'

interface NezukoMessage extends Message {
  command: string
  p: string
  context: any
}

interface ExecAsync {
  code: number
  stdout: string
  stderr: string
}

interface MemberDBConfig {
  todos: string[]
}

interface ServerDBConfig {
  [key: string]: any

  announcementChannel: string | null
  logChannel: string | null
  prefix: string
  rules: string[]
  levelMultiplier: string
  modMailChannel: string | null
  starboardChannel: string | null
  welcomeChannel: string | null
  leveling: boolean
  verifyUsers: boolean
  verfiedRole: string | null
  verifiedChannel: string | null
}

interface GeneralDBConfig {
  archivebox: { path: string | null }
  autorun: AutorunItem[]
  priceTracking: any[]
  disabledCommands: any[]
  docker: { host: string | null }
  emby: { apiKey: string | null; host: string | null; userID: string | null }
  googleHome: {
    ip: string | null
    language: string | null
    name: string | null
  }
  google: { apiKey: string | null }
  jackett: { apiKey: string | null; host: string | null }
  jellyfin: {
    apiKey: string | null
    host: string | null
    userID: string | null
    username: string
    password: string
  }
  lockedCommands: any[]
  meraki: { apiKey: string | null; serielNum: string | null }
  ombi: { apiKey: string | null; host: string | null; username: string | null }
  pihole: { apiKey: string | null; host: string | null }
  pioneerAVR: { host: string | null }
  routines: any[]
  sabnzbd: { apiKey: string | null; host: string | null }
  sengled: {
    jsessionid: string | null
    password: string | null
    username: string | null
  }
  shortcuts: any[]
  systemPowerControl: [{ host: 'xxx'; mac: 'xxx'; name: 'xxx' }]
  transmission: { host: string | null; port: string | null; ssl: boolean; username: string | null; password: string | null }
  tuyaDevices: [{ id: string | null; key: string | null; name: string | null }]
  webUI: { apiKey: string | null; commands: any[] }
}

interface ClientDB {
  server?: ServerDBConfig
  config?: GeneralDBConfig
}
