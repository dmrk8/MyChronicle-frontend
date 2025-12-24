import { useQuery } from '@tanstack/react-query';
import type { MediaPagination } from '../types/MediaInterface';
import {
  getTmdbPopularSeason,
  getTmdbTrendingMedia,
  type TmdbMediaType,
} from '../api/tmdbApi';

export function useTmdbTrendingMedia(mediaType: TmdbMediaType) {
  return useQuery<MediaPagination>({
    queryKey: ['tmdb', 'trending', mediaType] as const,
    queryFn: () => getTmdbTrendingMedia(mediaType),
  });
}

export function useTmdbPopularSeason(mediaType: TmdbMediaType) {
  return useQuery<MediaPagination>({
    queryKey: ['tmdb', 'popular-season', mediaType] as const,
    queryFn: () => getTmdbPopularSeason(mediaType),
  });
}