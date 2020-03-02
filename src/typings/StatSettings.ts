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
