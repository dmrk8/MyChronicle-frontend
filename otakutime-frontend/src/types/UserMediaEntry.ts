export const ReviewMediaType = {
  ANIME: 1,
  MANGA: 2,
  GAME: 3,
  MOVIE: 4,
  TV: 5,
} as const;

export type ReviewMediaType = typeof ReviewMediaType[keyof typeof ReviewMediaType];

export const ReviewMediaSource = {
  ANILIST: 1,
  TMDB: 2,
  IGDB: 3,
} as const;

export type ReviewMediaSource = typeof ReviewMediaSource[keyof typeof ReviewMediaSource];

export const ReviewStatus = {
  PLANNING: "planning",
  CURRENT: "current",
  COMPLETED: "completed",
  DROPPED: "dropped",
} as const;

export type ReviewStatus = typeof ReviewStatus[keyof typeof ReviewStatus];

export interface UserMediaEntryCreate {
  externalId: number;
  externalSource: ReviewMediaSource;
  mediaType: ReviewMediaType;
  status?: ReviewStatus;
  repeatCount?: number;
  isFavorite?: boolean;
  inLibrary?: boolean;
}

export interface UserMediaEntryDB extends UserMediaEntryCreate {
  id?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserMediaEntryUpdate {
  status?: ReviewStatus;
  repeatCount?: number;
  isFavorite?: boolean;
  inLibrary?: boolean;
}

export interface UserMediaEntryResponse {
  message: string;
  data?: UserMediaEntryDB | UserMediaEntryDB[];
  acknowledged?: boolean;
}

export interface UserMediaEntryPagination {
  results: UserMediaEntryDB[];
  page: number;
  perPage: number;
  hasNextPage: boolean;
  total: number;
}