export interface MediaMinimal {
  id: number;
  mediaSource: string;
  mediaType: string;

  title?: string;
  genres?: string[];
  status?: string;
  averageScore?: number;

  releaseDate?: string;
  firstAirDate?: string;

  format?: string;
  episodes?: number;
  duration?: number;
  chapters?: number;
  startDate?: string;
  endDate?: string;
  mainStudio?: string;
  coverImage?: string;
  season?: string;
  seasonYear?: number;
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