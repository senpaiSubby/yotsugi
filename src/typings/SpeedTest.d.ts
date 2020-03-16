interface RootObject {
  timestamp: string
  ping: Ping
  download: Download
  upload: Download
  isp: string
  interface: Interface
  server: Server
  result: Result
}

interface Result {
  id: string
  url: string
}

interface Server {
  id: number
  name: string
  location: string
  country: string
  host: string
  port: number
  ip: string
}

interface Interface {
  internalIp: string
  name: string
  macAddr: string
  isVpn: boolean
  externalIp: string
}

interface Download {
  bandwidth: number
  bytes: number
  elapsed: number
}

interface Ping {
  jitter: number
  latency: number
}
