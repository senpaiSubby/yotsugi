/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

interface MerakiDevice {
  id: string
  mac: string
  description?: string
  mdnsName?: string
  dhcpHostname?: string
  ip: string
  vlan: number
  switchport?: any
  usage: Usage
}

interface Usage {
  sent: number
  recv: number
}
