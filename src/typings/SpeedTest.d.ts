interface SpeedTestResult {
  speeds: Speeds
  client: Client
  server: Server
}

interface Server {
  host: string
  lat: number
  lon: number
  location: string
  country: string
  cc: string
  sponsor: string
  distance: number
  distanceMi: number
  ping: number
  id: string
}

interface Client {
  ip: string
  lat: number
  lon: number
  isp: string
  isprating: number
  rating: number
  ispdlavg: number
  ispulavg: number
  country: string
}

interface Speeds {
  download: number
  upload: number
  originalDownload: number
  originalUpload: number
}
