import type { MediaType } from "../constants/mediaConstants";

export interface MediaMinimal {
  id: number;
  externalSource: string;
  mediaType: string;

  // shared
  title: string;
  format?: string;
  genres?: string[];
  status?: string;
  coverImage?: string;
  bannerImage?: string;
  averageScore?: number;

  // anime
  episodes?: number;
  mainStudio?: string;

  // manga
  chapters?: number;

  // movie
  releaseDate?: string;

  // tv
  firstAirDate?: string;
}

export interface MediaPagination {
  results: MediaMinimal[];
  currentPage: number;
  perPage?: number;
  hasNextPage: boolean;
  total?: number;
}

export interface MediaFeaturedBulk {
  trending?: MediaMinimal[] | null;
  popularSeason?: MediaMinimal[] | null;
  upcoming?: MediaMinimal[] | null;
  allTime?: MediaMinimal[] | null;
  allTimeManhwa?: MediaMinimal[] | null;
}

export interface NextAiringEpisode {
  episode?: number;
  airingAt?: number;
  timeUntilAiring?: number;
}

export interface Tag {
  name: string;
  isMediaSpoiler: boolean;
  isGeneralSpoiler: boolean;
  rank: number;
}

export interface MediaBelongsToCollection {
  id: number;
  name: string;
  posterPath?: string;
  backdropPath?: string;
}

export interface CollectionPart {
  backdropPath?: string;
  posterPath?: string;
  id: number;
  title: string;
  mediaType: string;
  releaseDate?: string;
}

export interface CollectionDetailed {
  id: number;
  name: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  parts?: CollectionPart[];
}

export interface TMDBLastEpisodeToAir {
  name: string;
  overview: string;
  voteAverage: number;
  airDate: string;
  episodeNumber: number;
  episodeType: string;
  runtime?: number;
  seasonNumber: number;
  stillPath?: string;
}

export interface TMDBNextEpisodeToAir {
  airDate: string;
  episodeNumber: number;
  seasonNumber: number;
}

export interface MediaSeason {
  airDate?: string;
  episodeCount: number;
  name: string;
  overview: string;
  posterPath?: string;
  seasonNumber: number;
}

// Base interface
export interface MediaBase {
  id: number;
  externalSource: string;
  mediaType: string;
  title: string;
  format?: string;
  genres?: string[];
  status?: string;
  coverImage?: string;
  averageScore?: number;
  description?: string;
  bannerImage?: string;
  isAdult?: boolean;
  synonyms?: string[];
}

// Update or add simplified supporting types
export interface MediaStudio {
  isMain: boolean;
  name: string;
}

export interface MediaRelation {
  relationType: string;
  id: number;
  title: string;
  format?: string;
  status?: string;
  coverImage?: string;
  mediaType: MediaType;
}

export interface MediaRecommendation {
  id: number;
  title: string;
  coverImage?: string;
  mediaType: MediaType;
}

export interface MediaVoiceActor {
  image: string;
  name: string;
}

export interface MediaCharacter {
  role: string;
  image: string;
  name: string;
  voiceActor?: MediaVoiceActor;
}

export interface MediaCast {
  name: string;
  character?: string;
  castImage?: string;
}

// Detailed interfaces
export interface AnimeDetailed extends MediaBase {
  episodes?: number;
  studios?: MediaStudio[];
  duration?: number;
  season?: string;
  seasonYear?: number;
  startDate?: string;
  endDate?: string;
  nextAiringEpisode?: NextAiringEpisode;
  countryOfOrigin?: string;
  source?: string;
  tags?: Tag[];
  relations?: MediaRelation[];
  recommendations?: MediaRecommendation[];
  characters?: MediaCharacter[];
}

export interface MangaDetailed extends MediaBase {
  chapters?: number;
  volumes?: number;
  startDate?: string;
  endDate?: string;
  countryOfOrigin?: string;
  source?: string;
  tags?: Tag[];
  relations?: MediaRelation[];
  recommendations?: MediaRecommendation[];
  characters?: MediaCharacter[];
}

export interface MovieDetailed extends MediaBase {
  releaseDate?: string;
  budget?: number;
  revenue?: number;
  runtime?: number;
  originCountry: string[];
  originalLanguage?: string;
  belongsToCollection?: MediaBelongsToCollection;
  productionCompanies?: string[];
  keywords?: string[];
  recommendations?: MediaRecommendation[];
  alternativeTitles?: string[];
  credits?: MediaCast[];
  spokenLanguages?: string[];
}

export interface TVDetailed extends MediaBase {
  firstAirDate?: string;
  lastAirDate?: string;
  createdBy?: string[];
  numberOfEpisodes?: number;
  numberOfSeasons?: number;
  nextEpisodeToAir?: TMDBNextEpisodeToAir;
  seasons?: MediaSeason[];
  type?: string;
  originalLanguage?: string;
  inProduction?: boolean;
  languages?: string[];
  lastEpisodeToAir?: TMDBLastEpisodeToAir;
  networks?: string[];
  keywords?: string[];
  credits?: MediaCast[];
  recommendations?: MediaRecommendation[];
  productionCountries?: string[];
}