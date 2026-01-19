import { useFeaturedMediaAnilist, useAnimeDetail, useMangaDetail } from "./useAnilist";
import { useTmdbFeaturedBulk } from "./useTmdb";
import { useSearchAnilist } from "./useAnilist";
import { useSearchTmdbTv } from "./useTmdb";
import { useSearchTmdbMovie } from "./useTmdb";
import { useTmdbMovieDetail } from "./useTmdb";
import { useTmdbTvDetail } from "./useTmdb";
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

export function useMediaDetail({
  mediaId,
  mediaType,
}: {
  mediaId?: number;
  mediaType: MediaType;
}) {
  const animeQuery = useAnimeDetail(mediaId, { enabled: mediaType === MediaType.ANIME });
  const mangaQuery = useMangaDetail(mediaId, { enabled: mediaType === MediaType.MANGA });

  const anilistQuery = mediaType === MediaType.ANIME ? animeQuery : mediaType === MediaType.MANGA ? mangaQuery : null;

  const tmdbMovieQuery = useTmdbMovieDetail(mediaId, undefined, { enabled: mediaType === MediaType.MOVIE });
  const tmdbTvQuery = useTmdbTvDetail(mediaId, undefined, { enabled: mediaType === MediaType.TV });

  const tmdbQuery = mediaType === MediaType.MOVIE ? tmdbMovieQuery : tmdbTvQuery;

  return (mediaType === MediaType.ANIME || mediaType === MediaType.MANGA) ? anilistQuery : tmdbQuery;
}