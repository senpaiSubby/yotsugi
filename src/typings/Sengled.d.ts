interface SengledDevices {
  messageCode: string
  info: string
  description: string
  roomList: RoomList[]
  deviceNoRoomList: any[]
  deviceActiveHoursList: DeviceActiveHoursList[]
  success: boolean
}

interface DeviceActiveHoursList {
  deviceUuid: string
  deviceName: string
  activeHours: number
}

interface RoomList {
  roomId: number
  roomName: string
  roomImgType: number
  roomImgUrl: string
  roomStatus: number
  brightness: number
  colortemperature: number
  rgbColorR: number
  rgbColorG: number
  rgbColorB: number
  deviceList: DeviceList[]
  scheduleList: ScheduleList[]
}

interface ScheduleList {
  scheduleId: number
  startTime: string
  endTime: string
  repeate: string
  onoff: number
  type: number
  brightness: number
  colorTemperature: number
}

interface DeviceList {
  deviceUuid: string
  gatewayUuid: string
  deviceName: string
  brightness: number
  colortemperature: number
  onoff: number
  signalQuality: number
  signalValue: number
  activeHours: number
  isOnline: number
  power: string
  onCount: number
  powerConsumptionTime: string
  productCode: string
  attributeIds: string
  rgbColorR: number
  rgbColorG: number
  rgbColorB: number
}
