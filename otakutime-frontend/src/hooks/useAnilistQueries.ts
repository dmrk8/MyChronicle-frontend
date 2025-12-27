import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getFeaturedAnilistBulk,
  searchAnilist,
  getMediaDetail,
  type AnilistMediaType,
  type SearchAnilistParams,
} from "../api/anilistApi";
import type { MediaDetailed, MediaFeaturedBulk, MediaPagination } from "../types/MediaInterface";

export function useFeaturedMediaAnilist(mediaType: AnilistMediaType) {
  return useQuery<MediaFeaturedBulk>({
    queryKey: ["anilist", "featured", mediaType] as const,
    queryFn: () => getFeaturedAnilistBulk(mediaType),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSearchAnilist(params: SearchAnilistParams) {
  const { page: _page, ...keyParams } = params;

  return useInfiniteQuery<MediaPagination>({
    queryKey: ["anilist", "search", keyParams] as const,
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
    enabled: Boolean(params.search?.trim()),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}


export function useAnilistMediaDetail(mediaId?: number) {
  return useQuery<MediaDetailed>({
    queryKey: ["anilist", "media", mediaId] as const,
    queryFn: () => {
      if (!mediaId) throw new Error("mediaId is required");
      return getMediaDetail(mediaId);
    },
    enabled: typeof mediaId === "number" && mediaId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}