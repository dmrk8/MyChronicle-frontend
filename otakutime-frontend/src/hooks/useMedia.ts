import { useFeaturedMediaAnilist } from "./useAnilist";
import { useTmdbFeaturedBulk } from "./useTmdb";
import { useSearchAnilist } from "./useAnilist";
import { useSearchTmdbTv } from "./useTmdb";
import { useSearchTmdbMovie } from "./useTmdb";
import { useAnilistMediaDetail } from "./useAnilist";
import { useTmdbMovieDetail } from "./useTmdb";
import { useTmdbTvDetail } from "./useTmdb";
import type { AnilistMediaType, SearchAnilistParams } from "../api/anilistApi";
import type { SearchTmdbMovieParams, SearchTmdbTvParams, TmdbMediaType } from "../api/tmdbApi";
import type { MediaType } from "../types/Media";

    
export function useFeaturedMedia(mediaType: MediaType, mediaSource?: MediaSource) {
  const source = mediaSource || (mediaType === "anime" || mediaType === "manga" ? "anilist" : "tmdb");
  
  const anilistQuery = useFeaturedMediaAnilist(mediaType.toUpperCase() as AnilistMediaType, { enabled: source === "anilist" });
  const tmdbQuery = useTmdbFeaturedBulk(mediaType as TmdbMediaType, { enabled: source === "tmdb" });
  
  return source === "anilist" ? anilistQuery : tmdbQuery;
}

export function useMediaSearch(
  mediaType: MediaType,
  mediaSource?: MediaSource,
  anilistParams?: SearchAnilistParams,
  tmdbMovieParams?: SearchTmdbMovieParams,
  tmdbTvParams?: SearchTmdbTvParams,
  options?: { enabled?: boolean } 
) {
  const source = mediaSource || (mediaType === "anime" || mediaType === "manga" ? "anilist" : "tmdb");
  
  const anilistQuery = useSearchAnilist(
    anilistParams || {search: "", mediaType: mediaType as "anime" | "manga"}, 
    { enabled: (options?.enabled ?? true) && source === "anilist" }
  );
  
  const tmdbMovieQuery = useSearchTmdbMovie(
    tmdbMovieParams || { search: "" }, 
    { enabled: (options?.enabled ?? true) && source === "tmdb" && mediaType === "movie" }
  );
  
  const tmdbTvQuery = useSearchTmdbTv(
    tmdbTvParams || { search: "" }, 
    { enabled: (options?.enabled ?? true) && source === "tmdb" && mediaType === "tv" }
  );
  
  if (source === "anilist") return anilistQuery;
  return mediaType === "movie" ? tmdbMovieQuery : tmdbTvQuery;
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