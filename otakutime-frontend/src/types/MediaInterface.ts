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

export interface MediaFeaturedBulk {
  trending?: MediaMinimal[] | null;
  popularSeason?: MediaMinimal[] | null;
  upcoming?: MediaMinimal[] | null;
  allTime?: MediaMinimal[] | null;
  allTimeManhwa?: MediaMinimal[] | null;
}

export type MediaType = "anime" | "manga" | "tv" | "movie";
export type MediaSource = "anilist" | "tmdb"

// Matches backend MediaDetailed (Pydantic) aliases (camelCase)
export interface MediaDetailed {
  id: number;
  mediaSource: string;
  mediaType: string;

  // shared
  title: string;
  format?: string | null;
  genres?: string[] | null;
  status?: string | null;
  coverImage?: string | null;
  averageScore?: number | null;
  description?: string | null;
  bannerImage?: string | null;

  // anime
  episodes?: number | null;
  studios?: string[] | null;
  duration?: number | null;
  season?: string | null;
  seasonYear?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  nextAiringEpisode?: string | null;
  
  //anilist shared
  countryOfOrigin?: string | null;
  isAdult?: boolean | null;
  source?: string | null;
  synonyms?: string[] | null;

  // manga
  chapters?: number | null;
  volumes?: number | null;

  originalLanguage: string;

  // movie
  releaseDate?: string | null;
  budget?: number | null;
  revenue?: number | null;
  runtime?: number | null;

  // tv
  firstAirDate?: string | null;
  createdBy?: string | null;
  episodeRunTime?: number | null;
  lastAirDate?: string | null;
  numberOfEpisodes?: number | null;
  numberOfSeasons?: number | null;
  type?: string | null;
}