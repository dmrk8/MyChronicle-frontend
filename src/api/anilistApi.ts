import backendApi from './backendApi';
import type { MediaPagination, MediaFeaturedBulk, AnimeDetailed, MangaDetailed } from '../types/Media';

export interface SearchAnilistParams {
  mediaType: AnilistMediaType;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  season?: string;
  seasonYear?: number;
  format?: string;
  status?: string;
  genreIn?: string[];
  tagIn?: string[];
  isAdult?: boolean;
  countryOfOrigin?: string;
}

export type AnilistMediaType = "ANIME" | "MANGA"

export const getFeaturedAnilistBulk = async (mediaType: AnilistMediaType): Promise<MediaFeaturedBulk> => {
  const res = await backendApi.get(`/anilist/featured/bulk/${mediaType}`);
  return res.data;
};

export const searchAnilist = async (params: SearchAnilistParams): Promise<MediaPagination> => {
  const { mediaType, ...query } = params;

  const res = await backendApi.get(`/anilist/search/${mediaType}`, {
    params: query,
    paramsSerializer: {
      indexes: null, // This will serialize arrays without brackets
    }
  });

  return res.data;
};


export const getAnimeDetail = async (animeId: number): Promise<AnimeDetailed> => {
  const res = await backendApi.get(`/anilist/anime/${animeId}`);
  return res.data;
};

export const getMangaDetail = async (mangaId: number): Promise<MangaDetailed> => {
  const res = await backendApi.get(`/anilist/manga/${mangaId}`);
  return res.data;
};

