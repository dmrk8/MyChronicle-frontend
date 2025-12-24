export interface MediaMinimal {
  id: number;
  mediaSource: string;
  mediaType: string;

  // shared
  title: string;
  format?: string;
  genres?: string[];
  status?: string;
  coverImage?: string;
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

export interface MediaDetailed {
  id: number;
  mediaSource: string;
  mediaType?: string;

  title?: string;
  genres?: string[];
  status?: string;
  averageScore?: number;
  description?: string;

  isAdult?: boolean;
  source?: string;
  format?: string;
  episodes?: number;
  seasons?: number;
  duration?: number;
  volumes?: number;
  chapters?: number;
  countryOfOrigin?: string;
  synonyms?: string[];
  tags?: string[];

  releaseDate?: string;
  firstAirDate?: string;
  startDate?: string;
  endDate?: string;
  season?: string;
  seasonYear?: number;

  coverImage?: string;
  bannerImage?: string;

  mainStudio?: string;
  studios?: string[];
}

export interface MediaFeaturedBulk {
  trending?: MediaMinimal[] | null;
  popularSeason?: MediaMinimal[] | null;
  upcoming?: MediaMinimal[] | null;
  allTime?: MediaMinimal[] | null;
  allTimeManhwa?: MediaMinimal[] | null;
}