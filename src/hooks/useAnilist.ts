import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getAnimeDetail,
  getFeaturedAnilistBulk,
  getMangaDetail,
  searchAnilist,
  type AnilistMediaType,
  type SearchAnilistParams,
} from "../api/anilistApi";
import type { AnimeDetailed, MangaDetailed, MediaFeaturedBulk, MediaPagination } from "../types/Media";
import { getCurrentSeason } from "../constants/anilistFilters";

export function useFeaturedMediaAnilist(mediaType: AnilistMediaType, options?: { enabled?: boolean }) {
  return useQuery<MediaFeaturedBulk>({
    queryKey: ["anilist", "featured", mediaType] as const,
    queryFn: () => getFeaturedAnilistBulk(mediaType),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useSearchAnilist(params: SearchAnilistParams, options?: { enabled?: boolean }) {
  const { page: _page, ...keyParams } = params;

  return useInfiniteQuery<MediaPagination>({
    queryKey: ["anilist", "search", params.mediaType, keyParams] as const,
    queryFn: ({ pageParam }) =>
      searchAnilist({
        ...params,
        page: typeof pageParam === "number" ? pageParam : 1,
      }),
    initialPageParam: params.page ?? 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? true, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useAnimeDetail(animeId?: number, options?: { enabled?: boolean }) {
  return useQuery<AnimeDetailed>({
    queryKey: ["anilist", "anime", animeId] as const,
    queryFn: () => {
      if (!animeId) throw new Error("animeId is required");
      return getAnimeDetail(animeId);
    },
    enabled: options?.enabled ?? (typeof animeId === "number" && animeId > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useMangaDetail(mangaId?: number, options?: { enabled?: boolean }) {
  return useQuery<MangaDetailed>({
    queryKey: ["anilist", "manga", mangaId] as const,
    queryFn: () => {
      if (!mangaId) throw new Error("mangaId is required");
      return getMangaDetail(mangaId);
    },
    enabled: options?.enabled ?? (typeof mangaId === "number" && mangaId > 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useTrendingAnilist(mediaType: AnilistMediaType, options?: { enabled?: boolean }) {
  const { season, year } = getCurrentSeason();

  return useInfiniteQuery<MediaPagination>({
    queryKey: ['anilist', 'trending', mediaType, season, year] as const,
    queryFn: ({ pageParam }) =>
      searchAnilist({
        mediaType,
        sort: 'TRENDING_DESC',
        season: mediaType === 'ANIME' ? season : undefined,
        seasonYear: mediaType === 'ANIME' ? year : undefined,
        page: typeof pageParam === 'number' ? pageParam : 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
