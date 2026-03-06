import backendApi from './backendApi';
import type { MediaPagination, MovieDetailed, TVDetailed, CollectionDetailed } from '../types/Media';

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

export interface TmdbKeyword {
  id: number;
  name: string;
}

export const searchTmdbKeywords = async (query: string): Promise<TmdbKeyword[]> => {
  const res = await backendApi.get('/tmdb/keyword/search', { params: { query } });
  return res.data;
};

export const searchTmdbMovie = async (params: SearchTmdbMovieParams): Promise<MediaPagination> => {
  const res = await backendApi.get('/tmdb/search/movie', { params });
  return res.data;
};

export const searchTmdbTv = async (params: SearchTmdbTvParams): Promise<MediaPagination> => {
  const res = await backendApi.get('/tmdb/search/tv', { params });
  return res.data;
};

export const getTmdbMovieDetail = async (movieId: number, language?: string): Promise<MovieDetailed> => {
  const res = await backendApi.get(`/tmdb/media/movie/${movieId}`, { params: { language } });
  return res.data;
};

export const getTmdbTvDetail = async (tvId: number, language?: string): Promise<TVDetailed> => {
  const res = await backendApi.get(`/tmdb/media/tv/${tvId}`, { params: { language } });
  return res.data;
};

export const getTmdbCollectionDetail = async (collectionId: number, language?: string): Promise<CollectionDetailed> => {
  const res = await backendApi.get(`/tmdb/collection/${collectionId}`, { params: { language } });
  return res.data;
};

export interface GetTmdbTrendingParams {
  timeWindow?: 'day' | 'week';
  language?: string;
  page?: number;
}

export const getTmdbTrending = async (
  mediaType: TmdbMediaType,
  params?: GetTmdbTrendingParams,
): Promise<MediaPagination> => {
  const res = await backendApi.get(`/tmdb/trending/${mediaType}`, {
    params: {
      time_window: params?.timeWindow,
      language: params?.language,
      page: params?.page ?? 1,
    },
  });
  return res.data;
};
