interface DockerContainer {
  Id: string
  Names: string[]
  Image: string
  ImageID: string
  Command: string
  Created: number
  Ports: (Port | Ports2)[]
  Labels: Labels
  State: string
  Status: string
  HostConfig: HostConfig
  NetworkSettings: NetworkSettings
  Mounts: (Mount | Mounts2)[]
}

interface Mounts2 {
  Type: string
  Source: string
  Destination: string
  Mode: string
  RW: boolean
  Propagation: string
  Name?: string
  Driver?: string
}

interface Mount {
  Type: string
  Source: string
  Destination: string
  Mode: string
  RW: boolean
  Propagation: string
}

interface NetworkSettings {
  Networks: Networks
}

interface Networks {
  bridge: Bridge
}

interface Bridge {
  IPAMConfig?: any
  Links?: any
  Aliases?: any
  NetworkID: string
  EndpointID: string
  Gateway: string
  IPAddress: string
  IPPrefixLen: number
  IPv6Gateway: string
  GlobalIPv6Address: string
  GlobalIPv6PrefixLen: number
  MacAddress: string
  DriverOpts?: any
}

interface HostConfig {
  NetworkMode: string
}

interface Labels {
  build_version?: string
  'com.docker.compose.config-hash': string
  'com.docker.compose.container-number': string
  'com.docker.compose.oneoff': string
  'com.docker.compose.project': string
  'com.docker.compose.service': string
  'com.docker.compose.version': string
  maintainer?: string
  'traefik.enable'?: string
  'traefik.frontend.rule'?: string
  'traefik.port'?: string
  version?: string
  'app.description'?: string
  'app.dockerfile.author'?: string
  'app.docs.url'?: string
  'app.license'?: string
  'app.license.url'?: string
  'app.name'?: string
  'app.repo.url'?: string
  'traefik.protocol'?: string
  'org.opencontainers.image.description'?: string
  'org.opencontainers.image.documentation'?: string
  'org.opencontainers.image.title'?: string
  'org.opencontainers.image.url'?: string
  'org.opencontainers.image.vendor'?: string
  'org.opencontainers.image.version'?: string
  maintainers?: string
}

interface Ports2 {
  IP: string
  PrivatePort: number
  PublicPort: number
  Type: string
}

interface Port {
  IP?: string
  PrivatePort: number
  PublicPort?: number
  Type: string
}

interface mounts {
  Type: string
  Name: string
  Source: string
  Destination: string
  Driver: string
  Mode: string
  RW: string
  Propagation: string
}

interface ContainerList {
  name: string
  id: string
  image: string
  state: string
  status: string
  ports: number[]
  mounts?: (Mount | Mounts2)[]
}
