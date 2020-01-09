interface MangaSearch {
  id: string
  type: string
  links: Links
  attributes: Attributes
  relationships: Relationships
}

interface Relationships {
  genres: Genres
  categories: Genres
  castings: Genres
  installments: Genres
  mappings: Genres
  reviews: Genres
  mediaRelationships: Genres
  characters: Genres
  staff: Genres
  productions: Genres
  quotes: Genres
  episodes: Genres
  streamingLinks: Genres
  animeProductions: Genres
  animeCharacters: Genres
  animeStaff: Genres
}

interface Genres {
  links: Links2
}

interface Links2 {
  self: string
  related: string
}

interface Attributes {
  createdAt: string
  updatedAt: string
  slug: string
  synopsis: string
  coverImageTopOffset: number
  titles: Titles
  canonicalTitle: string
  abbreviatedTitles?: string[]
  averageRating?: string
  ratingFrequencies: RatingFrequencies
  userCount: number
  favoritesCount: number
  startDate: string
  endDate?: string
  nextRelease?: any
  popularityRank: number
  ratingRank?: number
  ageRating: string
  ageRatingGuide: string
  subtype: string
  status: string
  tba?: string
  posterImage: PosterImage
  coverImage?: CoverImage
  episodeCount?: number
  episodeLength?: number
  totalLength: number
  youtubeVideoId?: string
  showType: string
  nsfw: boolean
}

interface CoverImage {
  tiny: string
  small: string
  large: string
  original: string
  meta: Meta2
}

interface Meta2 {
  dimensions: Dimensions2
}

interface Dimensions2 {
  tiny: Tiny2
  small: Tiny
  large: Tiny2
}

interface Tiny2 {
  width: number
  height: number
}

interface PosterImage {
  tiny: string
  small: string
  medium: string
  large: string
  original: string
  meta: Meta
}

interface Meta {
  dimensions: Dimensions
}

interface Dimensions {
  tiny: Tiny
  small: Tiny
  medium: Tiny
  large: Tiny
}

interface Tiny {
  width?: number
  height?: number
}

interface RatingFrequencies {
  '2': string
  '6': string
  '8': string
  '10': string
  '11': string
  '12': string
  '13': string
  '14': string
  '16': string
  '18': string
  '20': string
  '3'?: string
  '4'?: string
  '5'?: string
  '7'?: string
  '9'?: string
  '15'?: string
  '17'?: string
  '19'?: string
}

interface Titles {
  en?: string
  en_jp: string
  ja_jp: string
  en_us?: string
}

interface Links {
  self: string
}
