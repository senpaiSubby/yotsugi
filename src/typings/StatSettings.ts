/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

interface StatSettingsChannels {
  enabled: boolean
  channelID: string
}

interface StatSettings {
  enabled: boolean
  categoryID: string
  total: StatSettingsChannels
  members: StatSettingsChannels
  bots: StatSettingsChannels
}
