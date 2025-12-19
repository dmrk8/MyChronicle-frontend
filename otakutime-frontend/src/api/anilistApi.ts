import backendApi from './backendApi';
import type { AnilistPagination } from '../types/AnilistInterface';
import type { AnilistMediaMinimal } from '../types/AnilistInterface';
import type { AnilistMediaDetailed } from '../types/AnilistInterface';
import type { MediaMinimal } from '../types/MediaInterface';
import { mapToMedia } from '../utils/MediaMapper';

interface SearchAnilistParams {
  mediaType: 'anime' | 'manga';
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  season?: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';
  seasonYear?: number;
  format?: string;
  status?: string;
  genreIn?: string[];
  tagIn?: string[];
  isAdult?: boolean;
  countryOfOrigin?: 'JP' | 'KR' | 'CN';
}


interface GetFeaturedParams {
  page?: number;
  perPage?: number;
  season?: string;
  seasonYear?: number;
  sort?: string;
  mediaType?: string;
}

export const getFeaturedAnilist = async (params: GetFeaturedParams = {}): Promise<MediaMinimal[]> => {
  const response = await backendApi.get('/anilist/featured', { params });
  return response.data.map(mapToMedia)
};

export const searchAnilist = async (params: SearchAnilistParams): Promise<AnilistPagination> => {
  const response = await backendApi.get(`/anilist/featured/${params.mediaType}`, { params });
  return response.data;
};

export const getTrendingAnime = async (): Promise<MediaMinimal[]> => {
    const params: GetFeaturedParams = {
        page: 1,
        perPage: 5,
        mediaType: "ANIME",
        season: "FALL",
        seasonYear: 2025,
        sort: "TRENDING_DESC"
        
    };
  return getFeaturedAnilist(params);
};

export const getPopularNowAnime = async (): Promise<MediaMinimal[]> => {
    const params: GetFeaturedParams = {
        page: 1,
        perPage: 5,
        mediaType: "ANIME",
        season: "FALL",
        seasonYear: 2025,
        sort: "POPULARITY_DESC"
        
    };
  return getFeaturedAnilist(params);
};

export const getUpcomingAnime = async (): Promise<MediaMinimal[]> => {
    const params: GetFeaturedParams = {
        page: 1,
        perPage: 5,
        mediaType: "ANIME",
        season: "WINTER",
        seasonYear: 2026,
        sort: "POPULARITY_DESC"
        
    };
  return getFeaturedAnilist(params);
};

export const getPopularAllTimeAnime = async (): Promise<MediaMinimal[]> => {
    const params: GetFeaturedParams = {
        page: 1,
        perPage: 5,
        mediaType: "ANIME",
        sort: "POPULARITY_DESC"
        
    };
  return getFeaturedAnilist(params);
};


export const getMediaDetail = async (mediaId: number): Promise<AnilistMediaDetailed> => {
  const response = await backendApi.get(`/anilist/media/${mediaId}`);
  return response.data;
};