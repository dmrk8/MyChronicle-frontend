import backendApi from './backendApi';
import type { MediaPagination, AnimeDetailed, MangaDetailed } from '../types/Media';

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
  genreNotIn?: string[];   
  tagIn?: string[];
  tagNotIn?: string[];    
  isAdult?: boolean;
  countryOfOrigin?: string;
}

export type AnilistMediaType = "ANIME" | "MANGA"


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

export const getMediaDetail = async (
  mediaType: AnilistMediaType,
  mediaId: number
): Promise<AnimeDetailed | MangaDetailed> => {
  const res = await backendApi.get(`/anilist/${mediaType}/${mediaId}`);
  return res.data;
};
