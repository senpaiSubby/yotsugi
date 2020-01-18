/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

interface SABNZBD {
  queue: Queue
}

interface Queue {
  version: string
  paused: boolean
  pause_int: string
  paused_all: boolean
  diskspace1: string
  diskspace2: string
  diskspace1_norm: string
  diskspace2_norm: string
  diskspacetotal1: string
  diskspacetotal2: string
  loadavg: string
  speedlimit: string
  speedlimit_abs: string
  have_warnings: string
  finishaction?: any
  quota: string
  have_quota: boolean
  left_quota: string
  cache_art: string
  cache_size: string
  cache_max: string
  kbpersec: string
  speed: string
  mbleft: string
  mb: string
  sizeleft: string
  size: string
  noofslots_total: number
  status: string
  timeleft: string
  eta: string
  refresh_rate: string
  scripts: any[]
  categories: string[]
  rating_enable: boolean
  noofslots: number
  start: number
  limit: number
  finish: number
  slots: Slot[]
}

interface Slot {
  index: number
  nzo_id: string
  unpackopts: string
  priority: string
  script: string
  filename: string
  password: string
  cat: string
  mbleft: string
  mb: string
  size: string
  sizeleft: string
  percentage: string
  mbmissing: string
  direct_unpack: number
  status: string
  timeleft: string
  eta: string
  avg_age: string
  has_rating: boolean
}

interface SabQue {
  filename: string
  index: number
  status: string
  percentage: string
  time: { left: string; eta: string }
  size: { total: string; left: string }
}
