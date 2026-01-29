export const ANILIST_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Ecchi',
  'Fantasy',
  'Hentai',
  'Horror',
  'Mahou Shoujo',
  'Mecha',
  'Music',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
] as const;

export const ANILIST_FORMATS = [
  'TV',
  'TV_SHORT',
  'MOVIE',
  'SPECIAL',
  'OVA',
  'ONA',
  'MUSIC',
  'MANGA',
  'NOVEL',
  'ONE_SHOT',
] as const;

export const ANILIST_SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;

export const ANILIST_SORT_OPTIONS = [
  "POPULARITY_DESC",
  "TRENDING_DESC"
] as const;

export const ANILIST_AIRING_STATUS = [
  'RELEASING',
  'FINISHED',
  'NOT_YET_RELEASED',
  'CANCELLED',
] as const;

export const ANILIST_PUBLISHING_STATUS = [
  'FINISHED',
  'RELEASING',
  'NOT_YET_RELEASED',
  'CANCELLED',
  'HIATUS'
] as const;

export const ANILIST_COUNTRIES = [
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'TW', name: 'Taiwan' },
] as const;

export type AnilistGenre = (typeof ANILIST_GENRES)[number];
export type AnilistFormat = (typeof ANILIST_FORMATS)[number];
export type AnilistSeason = (typeof ANILIST_SEASONS)[number];
export type AnilistAiringStatus = (typeof ANILIST_AIRING_STATUS)[number];
export type AnilistPublishingStatus = (typeof ANILIST_PUBLISHING_STATUS)[number];
export type AnilistCountry = (typeof ANILIST_COUNTRIES)[number];

// Utility function to format status strings for display
export const formatStatusDisplay = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to get current season and year
export const getCurrentSeason = (date?: Date): { season: AnilistSeason; year: number } => {
  const now = date || new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  let season: AnilistSeason;
  if (month <= 3) season = 'WINTER';
  else if (month <= 6) season = 'SPRING';
  else if (month <= 9) season = 'SUMMER';
  else season = 'FALL';

  return { season, year };
};

// Helper function to get next season and year
export const getNextSeason = (season: AnilistSeason, year: number): { season: AnilistSeason; year: number } => {
  const seasons = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
  const index = seasons.indexOf(season);
  const nextIndex = (index + 1) % seasons.length;
  const nextSeason = seasons[nextIndex] as AnilistSeason;
  const nextYear = season === 'FALL' ? year + 1 : year;

  return { season: nextSeason, year: nextYear };
};


