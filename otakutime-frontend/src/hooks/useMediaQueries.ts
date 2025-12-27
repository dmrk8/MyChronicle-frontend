import { useFeaturedMediaAnilist } from "./useAnilistQueries";
import { useTmdbFeaturedBulk } from "./useTmdbQueries";
import { useSearchAnilist } from "./useAnilistQueries";
import { useSearchTmdbTv } from "./useTmdbQueries";
import { useSearchTmdbMovie } from "./useTmdbQueries";
import { useAnilistMediaDetail } from "./useAnilistQueries";
import { useTmdbMovieDetail } from "./useTmdbQueries";
import { useTmdbTvDetail } from "./useTmdbQueries";
import type { MediaType } from "../types/MediaInterface";
import type { AnilistMediaType } from "../api/anilistApi";
import type { TmdbMediaType } from "../api/tmdbApi";

    
export function useFeaturedMedia(mediaType: MediaType, mediaSource?: MediaSource) {
  const source = mediaSource || (mediaType === "anime" || mediaType === "manga" ? "anilist" : "tmdb");
  
  const anilistQuery = useFeaturedMediaAnilist(mediaType.toUpperCase() as AnilistMediaType, { enabled: source === "anilist" });
  const tmdbQuery = useTmdbFeaturedBulk(mediaType as TmdbMediaType, { enabled: source === "tmdb" });
  
  return source === "anilist" ? anilistQuery : tmdbQuery;
}

export function useMediaSearch(params: {
  mediaType: MediaType;
  search: string;
  mediaSource?: MediaSource;
}) {
  const { mediaType, search, mediaSource } = params;
  const source = mediaSource || (mediaType === "anime" || mediaType === "manga" ? "anilist" : "tmdb");
  
  const anilistQuery = useSearchAnilist({
    mediaType: mediaType as "anime" | "manga",
    search,
  }, { enabled: source === "anilist" });
  
  const tmdbMovieQuery = useSearchTmdbMovie({ search }, { enabled: source === "tmdb" && mediaType === "movie" });
  const tmdbTvQuery = useSearchTmdbTv({ search }, { enabled: source === "tmdb" && mediaType === "tv" });
  
  const tmdbQuery = mediaType === "movie" ? tmdbMovieQuery : tmdbTvQuery;
  
  return source === "anilist" ? anilistQuery : tmdbQuery;
}


export function useMediaDetail({
  mediaId,
  mediaType,
  mediaSource,
}: {
  mediaId?: number;
  mediaType: MediaType;
  mediaSource?: MediaSource;
}) {
  const source = mediaSource || (mediaType === "anime" || mediaType === "manga" ? "anilist" : "tmdb");
  
  const anilistQuery = useAnilistMediaDetail(mediaId, { enabled: source === "anilist" });
  
  const tmdbMovieQuery = useTmdbMovieDetail(mediaId, undefined, { enabled: source === "tmdb" && mediaType === "movie" });
  const tmdbTvQuery = useTmdbTvDetail(mediaId, undefined, { enabled: source === "tmdb" && mediaType === "tv" });
  
  const tmdbQuery = mediaType === "movie" ? tmdbMovieQuery : tmdbTvQuery;
  
  return source === "anilist" ? anilistQuery : tmdbQuery;
}