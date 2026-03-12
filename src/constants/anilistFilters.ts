import tagsJson from '../public/anilistTags.json';

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

export const ANILIST_ANIME_FORMATS = [
  'TV',
  'TV_SHORT',
  'MOVIE',
  'SPECIAL',
  'OVA',
  'ONA',
  'MUSIC',
] as const;


export const ANILIST_MANGA_FORMATS = [
  'MANGA',
  'NOVEL',
  'ONE_SHOT',
] as const;

export const ANILIST_SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;

export const ANILIST_SORT_OPTIONS = {
  POPULARITY_DESC: "POPULARITY_DESC",
  POPULARITY_ASC  : "POPULARITY",
  TRENDING_ASC: "TRENDING",
  TRENDING_DESC: "TRENDING_DESC",
} as const;

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

export type AnilistSortOptions = (typeof ANILIST_SORT_OPTIONS)[keyof typeof ANILIST_SORT_OPTIONS];
export type AnilistGenre = (typeof ANILIST_GENRES)[number];
export type AnilistAnimeFormat = (typeof ANILIST_ANIME_FORMATS)[number];
export type AnilistMangaFormat = (typeof ANILIST_MANGA_FORMATS)[number];
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


export interface AnilistTag {
  id: number;
  name: string;
  isAdult: boolean;
  category: string;
  description: string;
}

export const ANILIST_TAGS: AnilistTag[] = tagsJson.MediaTagCollection;

// Group tags by their top-level category (e.g. "Theme", "Cast", "Setting", "Technical", "Demographic")
export const ANILIST_TAGS_BY_CATEGORY: Record<string, AnilistTag[]> = 
  ANILIST_TAGS.reduce((acc, tag) => {
    const topCategory = tag.category.split('-')[0].trim();
    if (!acc[topCategory]) acc[topCategory] = [];
    acc[topCategory].push(tag);
    return acc;
  }, {} as Record<string, AnilistTag[]>);

export const ANILIST_TAG_CATEGORY_ORDER = [
  'Theme',
  'Cast',
  'Setting',
  'Demographic',
  'Technical',
  'Sexual Content',
];

