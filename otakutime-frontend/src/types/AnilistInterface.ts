import type { MediaMinimal } from "./MediaInterface";

export interface Title {
  english?: string;
  romaji?: string;
  native?: string;
}

export interface NextAiringEpisode {
  episode?: number;
  airingAt?: number;
  timeUntilAiring?: number;
}

export interface MediaDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface CoverImage {
  medium?: string;
  large?: string;
}

export interface Tag {
  name: string;
  isMediaSpoiler: boolean;
  isGeneralSpoiler: boolean;
  rank: number;
}

export interface RelationNode {
  id: number;
  title: Title;
  format?: string;
  status?: string;
}

export interface RelationEdge {
  relationType: string;
  node: RelationNode;
}

export interface Relations {
  edges: RelationEdge[];
}

export interface StudioNode {
  id: number;
  name: string;
}

export interface StudioEdge {
  isMain: boolean;
  node: StudioNode;
}

export interface Studios {
  edges: StudioEdge[];
}

export interface AnilistMediaMinimal {
  id: number;
  type: string;
  title: Title;
  format?: string;
  genres?: string[];
  episodes?: number;
  duration?: number;
  chapters?: number;
  status?: string;
  startDate?: MediaDate;
  endDate?: MediaDate;
  nextAiringEpisode?: NextAiringEpisode;
  mainStudio?: string;
  coverImage?: CoverImage;
  season?: string;
  seasonYear?: number;
  averageScore?: number;
}

export interface AnilistMediaDetailed {
  id: number;
  averageScore?: number;
  bannerImage?: string;
  chapters?: number;
  countryOfOrigin?: string;
  coverImage: CoverImage;
  description?: string;
  duration?: number;
  endDate?: MediaDate;
  episodes?: number;
  format?: string;
  genres?: string[];
  isAdult?: boolean;
  nextAiringEpisode?: NextAiringEpisode;
  relations: Relations;
  season?: string;
  seasonYear?: number;
  source?: string;
  startDate?: MediaDate;
  status?: string;
  synonyms?: string[];
  title: Title;
  type: string;
  volumes?: number;
  tags: Tag[];
  studios: Studios;
}

export interface AnilistPageInfo {
  currentPage: number;
  hasNextPage: boolean;
  perPage: number;
  total: number;
}

export interface AnilistPagination {
  results: AnilistMediaMinimal[];
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  total: number;
}

export interface FeaturedAnilistResponse {
  trending: MediaMinimal[];
  popularSeason: MediaMinimal[];
  upcoming: MediaMinimal[];
  allTime: MediaMinimal[];
}
