interface JackettAPISearch {
  Results: Result[]
  Indexers: Indexer[]
}

interface Indexer {
  ID: string
  Name: string
  Status: number
  Results: number
  Error?: any
}

interface Result {
  FirstSeen: string
  Tracker: string
  TrackerId: string
  CategoryDesc: string
  BlackholeLink?: any
  Title: string
  Guid: string
  Link?: string
  Comments?: string
  PublishDate: string
  Category: number[]
  Size: number
  Files?: number
  Grabs?: number
  Description?: string
  RageID?: number
  TVDBId?: number
  Imdb?: number
  TMDb?: number
  Seeders: number
  Peers: number
  BannerUrl?: any
  InfoHash?: string
  MagnetUri?: string
  MinimumRatio?: number
  MinimumSeedTime?: number
  DownloadVolumeFactor: number
  UploadVolumeFactor: number
  Gain: number
}
