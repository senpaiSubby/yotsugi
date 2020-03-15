/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

interface AutoRun {
  channelID: string | null
  tasks: AutorunItem[]
}
interface AutorunItem {
  time: string
  commands: CommandData[]
}

interface CommandData {
  enabled: boolean
  command: string
}
