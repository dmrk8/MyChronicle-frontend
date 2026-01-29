import { useFeaturedMediaAnilist} from "./useAnilist";
import { useTmdbFeaturedBulk } from "./useTmdb";
import { useSearchAnilist } from "./useAnilist";
import { useSearchTmdbTv } from "./useTmdb";
import { useSearchTmdbMovie } from "./useTmdb";
import type { AnilistMediaType, SearchAnilistParams } from "../api/anilistApi";
import type { SearchTmdbMovieParams, SearchTmdbTvParams, TmdbMediaType } from "../api/tmdbApi";
import { MediaType } from "../constants/mediaConstants";
    
export function useFeaturedMedia(mediaType: MediaType) {
  const anilistQuery = useFeaturedMediaAnilist(mediaType as AnilistMediaType, { enabled: mediaType === MediaType.ANIME || mediaType === MediaType.MANGA });
  const tmdbQuery = useTmdbFeaturedBulk(mediaType as TmdbMediaType, { enabled: mediaType === MediaType.MOVIE || mediaType === MediaType.TV });
  
  return (mediaType === MediaType.ANIME || mediaType === MediaType.MANGA) ? anilistQuery : tmdbQuery;
}

export function useMediaSearch(
  mediaType: MediaType,
  anilistParams?: SearchAnilistParams,
  tmdbMovieParams?: SearchTmdbMovieParams,
  tmdbTvParams?: SearchTmdbTvParams,
  options?: { enabled?: boolean } 
) {
  const anilistQuery = useSearchAnilist(
    anilistParams || {search: "", mediaType: mediaType as AnilistMediaType}, 
    { enabled: (options?.enabled ?? true) && (mediaType === MediaType.ANIME || mediaType === MediaType.MANGA) }
  );
  
  const tmdbMovieQuery = useSearchTmdbMovie(
    tmdbMovieParams || { search: "" }, 
    { enabled: (options?.enabled ?? true) && mediaType === MediaType.MOVIE }
  );
  
  const tmdbTvQuery = useSearchTmdbTv(
    tmdbTvParams || { search: "" }, 
    { enabled: (options?.enabled ?? true) && mediaType === MediaType.TV }
  );
  
  if (mediaType === MediaType.ANIME || mediaType === MediaType.MANGA) return anilistQuery;
  return mediaType === MediaType.MOVIE ? tmdbMovieQuery : tmdbTvQuery;
}
