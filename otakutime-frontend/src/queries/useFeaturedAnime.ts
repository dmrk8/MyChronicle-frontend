import { useQuery } from "@tanstack/react-query";
import type { FeaturedAnilistResponse } from "../types/AnilistInterface";
import { getFeaturedAnilistBulk } from "../api/anilistApi";



export function useFeaturedAnime() {
    return useQuery<FeaturedAnilistResponse>({
        queryKey: ["anilist", "featured"],
        queryFn: getFeaturedAnilistBulk,
        staleTime: 10 * 60 * 1000,
    });
}