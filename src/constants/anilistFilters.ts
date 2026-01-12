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

export const ANILIST_SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER'] as const;

export const SORT_OPTIONS = [
  "POPULARITY_DESC",
  "TRENDING_DESC"
] as const;

export const STATUS = [
  'FINISHED',
  'RELEASING',
  'NOT_YET_RELEASED',
  'CANCELLED',
  'HIATUS'
] as const;

export const MANGA_COUNTRIES = [
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'TW', name: 'Taiwan' },
] as const;

export type AnilistGenre = (typeof ANILIST_GENRES)[number];
export type AnilistFormat = (typeof ANILIST_FORMATS)[number];
export type AnilistSeason = (typeof ANILIST_SEASONS)[number];
export type AnilistStatus = (typeof STATUS)[number];
export type MangaCountry = (typeof MANGA_COUNTRIES)[number];