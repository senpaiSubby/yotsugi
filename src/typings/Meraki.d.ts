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
