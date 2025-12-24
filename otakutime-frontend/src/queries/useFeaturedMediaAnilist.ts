import { useQuery } from "@tanstack/react-query";
import { getFeaturedAnilistBulk, type AnilistMediaType } from "../api/anilistApi";
import type { MediaFeaturedBulk } from "../types/MediaInterface";

export function useFeaturedMediaAnilist(mediaType: AnilistMediaType) {
  return useQuery<MediaFeaturedBulk>({
    queryKey: ["anilist", "featured", mediaType] as const,
    queryFn: () => getFeaturedAnilistBulk(mediaType),
    staleTime: 10 * 60 * 1000,
  });
}