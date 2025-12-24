import backendApi from './backendApi';
import type { MediaPagination } from '../types/MediaInterface';

export type TmdbMediaType = 'movie' | 'tv';


export const getTmdbTrendingMedia = async (
  mediaType: TmdbMediaType
): Promise<MediaPagination> => {
  const res = await backendApi.get(`/tmdb/trending/${mediaType}`);
  return res.data;
};


export const getTmdbPopularSeason = async (
  mediaType: TmdbMediaType
): Promise<MediaPagination> => {
  const res = await backendApi.get(`/tmdb/popular-season/${mediaType}`);
  return res.data;
};