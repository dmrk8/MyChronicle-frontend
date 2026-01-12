import { MediaType, MediaExternalSource } from '../constants/mediaConstants';

export const UserMediaEntryStatus = {
  PLANNING: "PLANNING",  
  CURRENT: "CURRENT",    
  ON_HOLD: "ON_HOLD",   
  COMPLETED: "COMPLETED", 
  DROPPED: "DROPPED",    
} as const;

export type UserMediaEntryStatus = typeof UserMediaEntryStatus[keyof typeof UserMediaEntryStatus];

export interface UserMediaEntryCreate {
  externalId: number;
  externalSource: MediaExternalSource;
  mediaType: MediaType;
  title: string;
  coverImage?: string;
  status?: UserMediaEntryStatus;
  repeatCount?: number;
  isFavorite?: boolean;
  inLibrary?: boolean;
}

export interface UserMediaEntry extends UserMediaEntryCreate {
  id?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserMediaEntryUpdate {
  status?: UserMediaEntryStatus;
  repeatCount?: number;
  isFavorite?: boolean;
  inLibrary?: boolean;
}

export interface UserMediaEntryPagination {
  results: UserMediaEntry[];
  page: number;
  perPage: number;
  hasNextPage: boolean;
  total: number;
}

export const UserMediaEntrySortFields = {
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
  TITLE: "title",
  //RATING: "rating",
} as const;

export type UserMediaEntrySortFields = typeof UserMediaEntrySortFields[keyof typeof UserMediaEntrySortFields];

export const UserMediaEntrySortOptions = {
  CREATED_AT_ASC: 1,
  CREATED_AT_DESC: -1,
  UPDATED_AT_ASC: 1,
  UPDATED_AT_DESC: -1,
  TITLE_ASC: 1,
  TITLE_DESC: -1,
  //RATING_ASC: 1,
  //RATING_DESC: -1,
} as const;

export type UserMediaEntrySortOptions = typeof UserMediaEntrySortOptions[keyof typeof UserMediaEntrySortOptions];