import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getMediaDetail,
  searchAnilist,
  type AnilistMediaType,
  type SearchAnilistParams,
} from "../api/anilistApi";
import type { AnimeDetailed, MangaDetailed, MediaPagination } from "../types/Media";
import { getCurrentSeason } from "../constants/anilistFilters";

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

export function useMediaDetail(
  mediaType: "ANIME",
  mediaId?: number,
  options?: { enabled?: boolean }
): ReturnType<typeof useQuery<AnimeDetailed>>;

export function useMediaDetail(
  mediaType: "MANGA",
  mediaId?: number,
  options?: { enabled?: boolean }
): ReturnType<typeof useQuery<MangaDetailed>>;

export function useMediaDetail(
  mediaType: AnilistMediaType,
  mediaId?: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["anilist", mediaType, mediaId] as const,
    queryFn: () => {
      if (!mediaId) throw new Error("mediaId is required");
      return getMediaDetail(mediaType, mediaId);
    },
    enabled: options?.enabled ?? (typeof mediaId === "number" && mediaId > 0),
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
