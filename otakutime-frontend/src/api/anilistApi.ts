import backendApi from './backendApi';
import type { MediaPagination } from '../types/MediaInterface';
import type { AnilistMediaDetailed, AnilistMediaMinimal, AnilistPagination, FeaturedAnilistResponse } from '../types/AnilistInterface';
import type { MediaFeaturedBulk } from '../types/MediaInterface';

export interface SearchAnilistParams {
  mediaType: 'anime' | 'manga';
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

interface GetFeaturedParams {
  page?: number;
  perPage?: number;
  season?: string;
  seasonYear?: number;
  sort?: string;
  mediaType?: string;
}

export type AnilistMediaType = "ANIME" | "MANGA"

export const getFeaturedAnilistBulk = async (mediaType: AnilistMediaType): Promise<MediaFeaturedBulk> => {
  
  const res = await backendApi.get(`/anilist/featured/bulk/${mediaType}`);
  return res.data
};

export const searchAnilist = async (
  params: SearchAnilistParams
): Promise<MediaPagination> => {
  const { mediaType, ...query } = params;

  const res = await backendApi.get(`/anilist/search/${mediaType}`, {
    params: query, 
  });

  return res.data;
};

export const getMediaDetail = async (mediaId: number): Promise<AnilistMediaDetailed> => {
  const response = await backendApi.get(`/anilist/media/${mediaId}`);
  return response.data;
};