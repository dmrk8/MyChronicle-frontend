import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { MediaPagination, MediaFeaturedBulk, MovieDetailed, TVDetailed, CollectionDetailed } from '../types/Media';
import {
  searchTmdbMovie,
  searchTmdbTv,
  getTmdbMovieDetail,
  getTmdbTvDetail,
  getTmdbFeaturedBulk,
  getTmdbCollectionDetail,
  searchTmdbKeywords,
  type TmdbMediaType,
  type SearchTmdbMovieParams,
  type SearchTmdbTvParams,
  type TmdbKeyword,
} from '../api/tmdbApi';

export function useTmdbFeaturedBulk(mediaType: TmdbMediaType, options?: { enabled?: boolean }) {
  return useQuery<MediaFeaturedBulk>({
    queryKey: ['tmdb', 'featured-bulk', mediaType] as const,
    queryFn: () => getTmdbFeaturedBulk(mediaType),
    staleTime: 10 * 60 * 1000,
    select: (data) => ({
      trending: data.trending?.slice(0, 6),
      popularSeason: data.popularSeason?.slice(0, 6),
      upcoming: data.upcoming?.slice(0, 6),
      allTime: data.allTime?.slice(0, 6),
      allTimeManhwa: data.allTimeManhwa?.slice(0, 6),
    }),
    ...options,
  });
}

export function useSearchTmdbMovie(params: SearchTmdbMovieParams, options?: { enabled?: boolean }) {
  const { page: _page, ...keyParams } = params;

  return useInfiniteQuery<MediaPagination>({
    queryKey: ['tmdb', 'search', 'movie', keyParams] as const,
    queryFn: ({ pageParam }) =>
      searchTmdbMovie({
        ...params,
        page: typeof pageParam === 'number' ? pageParam : 1,
      }),
    initialPageParam: params.page ?? 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? Boolean(params.search?.trim()),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useSearchTmdbTv(params: SearchTmdbTvParams, options?: { enabled?: boolean }) {
  const { page: _page, ...keyParams } = params;

  return useInfiniteQuery<MediaPagination>({
    queryKey: ['tmdb', 'search', 'tv', keyParams] as const,
    queryFn: ({ pageParam }) =>
      searchTmdbTv({
        ...params,
        page: typeof pageParam === 'number' ? pageParam : 1,
      }),
    initialPageParam: params.page ?? 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? Boolean(params.search?.trim()),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useTmdbMovieDetail(movieId?: number, language?: string, options?: { enabled?: boolean }) {
  return useQuery<MovieDetailed>({
    queryKey: ['tmdb', 'movie', movieId, language] as const,
    queryFn: () => {
      if (!movieId) throw new Error('movieId is required');
      return getTmdbMovieDetail(movieId, language);
    },
    enabled: options?.enabled ?? (typeof movieId === 'number' && movieId > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useTmdbTvDetail(tvId?: number, language?: string, options?: { enabled?: boolean }) {
  return useQuery<TVDetailed>({
    queryKey: ['tmdb', 'tv', tvId, language] as const,
    queryFn: () => {
      if (!tvId) throw new Error('tvId is required');
      return getTmdbTvDetail(tvId, language);
    },
    enabled: options?.enabled ?? (typeof tvId === 'number' && tvId > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useTmdbCollectionDetail(collectionId?: number, language?: string, options?: { enabled?: boolean }) {
  return useQuery<CollectionDetailed>({
    queryKey: ['tmdb', 'collection', collectionId, language] as const,
    queryFn: () => {
      if (!collectionId) throw new Error('collectionId is required');
      return getTmdbCollectionDetail(collectionId, language);
    },
    enabled: options?.enabled ?? (typeof collectionId === 'number' && collectionId > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useTmdbKeywordSearch(query: string, options?: { enabled?: boolean }) {
  return useQuery<TmdbKeyword[]>({
    queryKey: ['tmdb', 'keyword', 'search', query] as const,
    queryFn: () => searchTmdbKeywords(query),
    enabled: options?.enabled ?? Boolean(query.trim().length >= 1),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}