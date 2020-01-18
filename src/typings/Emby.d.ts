/*!
 * Coded by CallMeKory - https://github.com/callmekory
 * 'It’s not a bug – it’s an undocumented feature.'
 */

// Stats command
interface EmbyStats {
  MovieCount: number
  SeriesCount: number
  EpisodeCount: number
  ArtistCount: number
  ProgramCount: number
  TrailerCount: number
  SongCount: number
  AlbumCount: number
  MusicVideoCount: number
  BoxSetCount: number
  BookCount: number
  ItemCount: number
}

// Streams command
interface NowPlaying {
  PlayState: PlayState
  AdditionalUsers: any[]
  Capabilities: Capabilities
  RemoteEndPoint: string
  PlayableMediaTypes: string[]
  Id: string
  Client: string
  LastActivityDate: string
  LastPlaybackCheckIn: string
  DeviceName: string
  DeviceId: string
  ApplicationVersion: string
  SupportedCommands: string[]
  IsActive: boolean
  SupportsMediaControl: boolean
  SupportsRemoteControl: boolean
  HasCustomDeviceName: boolean
  ServerId: string
  UserId?: string
  UserName?: string
  NowPlayingItem?: NowPlayingItem
  FullNowPlayingItem?: FullNowPlayingItem
  NowPlayingQueue?: NowPlayingQueue[]
  PlaylistItemId?: string
}

interface NowPlayingQueue {
  Id: string
  PlaylistItemId: string
}

interface FullNowPlayingItem {
  LocalTrailerIds: any[]
  RemoteTrailerIds: any[]
  AdditionalParts: any[]
  LocalAlternateVersions: any[]
  LinkedAlternateVersions: any[]
  SubtitleFiles: any[]
  HasSubtitles: boolean
  IsPlaceHolder: boolean
  DefaultVideoStreamIndex: number
  VideoType: string
  Size: number
  Container: string
  RemoteTrailers: any[]
  IsHD: boolean
  IsShortcut: boolean
  Width: number
  Height: number
  ExtraIds: any[]
  SupportsExternalTransfer: boolean
}

interface NowPlayingItem {
  Name: string
  ServerId: string
  Id: string
  DateCreated: string
  Container: string
  PremiereDate: string
  ExternalUrls: ExternalUrl[]
  Path: string
  EnableMediaSourceDisplay: boolean
  Overview: string
  Taglines: any[]
  Genres: any[]
  RunTimeTicks: number
  ProductionYear: number
  IndexNumber: number
  ParentIndexNumber: number
  ProviderIds: ProviderIds
  IsHD: boolean
  IsFolder: boolean
  ParentId: string
  Type: string
  Studios: any[]
  GenreItems: any[]
  ParentLogoItemId: string
  ParentBackdropItemId: string
  ParentBackdropImageTags: string[]
  LocalTrailerCount: number
  SeriesName: string
  SeriesId: string
  SeasonId: string
  SpecialFeatureCount: number
  PrimaryImageAspectRatio: number
  SeriesPrimaryImageTag: string
  SeasonName: string
  MediaStreams: MediaStream[]
  VideoType: string
  ImageTags: ImageTags
  BackdropImageTags: any[]
  ScreenshotImageTags: any[]
  ParentLogoImageTag: string
  SeriesStudio: string
  Chapters: Chapter[]
  LocationType: string
  MediaType: string
  Width: number
  Height: number
}

interface Chapter {
  StartPositionTicks: number
  Name: string
  ImageDateModified: string
}

interface ImageTags {
  Primary: string
}

interface MediaStream {
  Codec: string
  TimeBase: string
  CodecTimeBase: string
  Title?: string
  VideoRange?: string
  DisplayTitle: string
  NalLengthSize?: string
  IsInterlaced: boolean
  IsAVC?: boolean
  BitRate: number
  BitDepth?: number
  RefFrames?: number
  IsDefault: boolean
  IsForced: boolean
  Height?: number
  Width?: number
  AverageFrameRate?: number
  RealFrameRate?: number
  Profile: string
  Type: string
  AspectRatio?: string
  Index: number
  IsExternal: boolean
  IsTextSubtitleStream: boolean
  SupportsExternalStream: boolean
  PixelFormat?: string
  Level: number
  Language?: string
  ChannelLayout?: string
  Channels?: number
  SampleRate?: number
}

interface ProviderIds {
  Imdb: string
  Tvdb: string
}

interface ExternalUrl {
  Name: string
  Url: string
}

interface Capabilities {
  PlayableMediaTypes: string[]
  SupportedCommands: string[]
  SupportsMediaControl: boolean
  SupportsContentUploading: boolean
  SupportsPersistentIdentifier: boolean
  SupportsSync: boolean
  Id?: string
  DeviceProfile?: DeviceProfile
}

interface DeviceProfile {
  EnableAlbumArtInDidl: boolean
  EnableSingleAlbumArtLimit: boolean
  EnableSingleSubtitleLimit: boolean
  SupportedMediaTypes: string
  MaxAlbumArtWidth: number
  MaxAlbumArtHeight: number
  MaxStreamingBitrate: number
  MaxStaticBitrate: number
  MusicStreamingTranscodingBitrate: number
  MaxStaticMusicBitrate: number
  TimelineOffsetSeconds: number
  RequiresPlainVideoItems: boolean
  RequiresPlainFolders: boolean
  EnableMSMediaReceiverRegistrar: boolean
  IgnoreTranscodeByteRangeRequests: boolean
  XmlRootAttributes: any[]
  DirectPlayProfiles: DirectPlayProfile[]
  TranscodingProfiles: TranscodingProfile[]
  ContainerProfiles: any[]
  CodecProfiles: CodecProfile[]
  ResponseProfiles: ResponseProfile[]
  SubtitleProfiles: SubtitleProfile[]
}

interface SubtitleProfile {
  Format: string
  Method: string
}

interface ResponseProfile {
  Container: string
  Type: string
  MimeType: string
  Conditions: any[]
}

interface CodecProfile {
  Type: string
  Conditions: Condition[]
  ApplyConditions: any[]
  Codec?: string
}

interface Condition {
  Condition: string
  Property: string
  Value: string
  IsRequired: boolean
}

interface TranscodingProfile {
  Container: string
  Type: string
  AudioCodec: string
  Protocol?: string
  EstimateContentLength: boolean
  EnableMpegtsM2TsMode: boolean
  TranscodeSeekInfo: string
  CopyTimestamps: boolean
  Context: string
  EnableSubtitlesInManifest: boolean
  MaxAudioChannels?: string
  MinSegments: number
  SegmentLength: number
  BreakOnNonKeyFrames: boolean
  VideoCodec?: string
}

interface DirectPlayProfile {
  Container: string
  AudioCodec?: string
  VideoCodec?: string
  Type: string
}

interface PlayState {
  CanSeek: boolean
  IsPaused: boolean
  IsMuted: boolean
  RepeatMode: string
  PositionTicks?: number
  VolumeLevel?: number
  AudioStreamIndex?: number
  MediaSourceId?: string
  PlayMethod?: string
}

// Recent command
