import backendApi from './backendApi';
import type { MediaPagination, MediaFeaturedBulk, MediaDetailed } from '../types/Media';

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
  });

  return res.data;
};


export const getMediaDetail = async (mediaId: number): Promise<MediaDetailed> => {
  const res = await backendApi.get(`/anilist/media/${mediaId}`);
  return res.data;
};

