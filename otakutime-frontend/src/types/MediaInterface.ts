export interface MediaMinimal {
  // Common fields
  id: number;

  // Anilist-specific or shared
  title?: Title | string;
  format?: string;
  genres?: string[];
  episodes?: number;
  duration?: number;
  chapters?: number;
  status?: string;
  startDate?: MediaDate | string;
  endDate?: MediaDate;
  nextAiringEpisode?: NextAiringEpisode;
  mainStudio?: string;
  coverImage?: CoverImage;
  season?: string;
  seasonYear?: number;
  averageScore?: number;

  // TMDB-specific or shared
  adult?: boolean;
  backdropPath?: string;
  genreIds?: number[];
  originalLanguage?: string;
  popularity?: number;
  mediaType?: string;
  voteAverage?: number;
  originalTitle?: string;
  releaseDate?: string;
  name?: string;
  originalName?: string;
  firstAirDate?: string;
  originCountry?: string[];
}