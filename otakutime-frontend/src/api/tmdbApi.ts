import backendApi from './backendApi';
import type { MediaPagination, MediaDetailed, MediaFeaturedBulk } from '../types/MediaInterface';

export type TmdbMediaType = 'movie' | 'tv';

export interface SearchTmdbMovieParams {
  search?: string;
  page?: number;
  language?: string;
  sortBy?: string;
  primaryReleaseDateGte?: string;
  primaryReleaseDateLte?: string;
  withGenres?: string;
  withKeywords?: string;
  withRuntimeGte?: number;
  withRuntimeLte?: number;
  withOriginalLanguage?: string;
  withoutGenres?: string;
  withoutKeywords?: string;
}

export interface SearchTmdbTvParams {
  search?: string;
  page?: number;
  language?: string;
  sortBy?: string;
  airDateGte?: string;
  airDateLte?: string;
  firstAirDateGte?: string;
  firstAirDateLte?: string;
  withGenres?: string;
  withKeywords?: string;
  withRuntimeGte?: number;
  withRuntimeLte?: number;
  withOriginalLanguage?: string;
  withStatus?: string;
  withoutGenres?: string;
  withoutKeywords?: string;
}

export const searchTmdbMovie = async (params: SearchTmdbMovieParams): Promise<MediaPagination> => {
  const res = await backendApi.get('/tmdb/search/movie', { params });
  return res.data;
};

export const searchTmdbTv = async (params: SearchTmdbTvParams): Promise<MediaPagination> => {
  const res = await backendApi.get('/tmdb/search/tv', { params });
  return res.data;
};

export const getTmdbMovieDetail = async (movieId: number, language?: string): Promise<MediaDetailed> => {
  const res = await backendApi.get(`/tmdb/media/movie/${movieId}`, { params: { language } });
  return res.data;
};

export const getTmdbTvDetail = async (tvId: number, language?: string): Promise<MediaDetailed> => {
  const res = await backendApi.get(`/tmdb/media/tv/${tvId}`, { params: { language } });
  return res.data;
};

export const getTmdbFeaturedBulk = async (mediaType: TmdbMediaType): Promise<MediaFeaturedBulk> => {
  const res = await backendApi.get('/tmdb/featured-bulk', { params: { mediaType } });
  return res.data;
};
