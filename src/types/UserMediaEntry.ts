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
  isAdult?: boolean;
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
  title?: string;
  coverImage?: string;
  isAdult?: boolean;
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

export const statusLabels: Record<UserMediaEntryStatus | 'all', string> = {
  all: 'All',
  [UserMediaEntryStatus.CURRENT]: 'Current',
  [UserMediaEntryStatus.COMPLETED]: 'Completed',
  [UserMediaEntryStatus.ON_HOLD]: 'On Hold',
  [UserMediaEntryStatus.DROPPED]: 'Dropped',
  [UserMediaEntryStatus.PLANNING]: 'Planning',
};

export const statuses: (UserMediaEntryStatus | 'all')[] = [
  'all',
  UserMediaEntryStatus.CURRENT,
  UserMediaEntryStatus.COMPLETED,
  UserMediaEntryStatus.ON_HOLD,
  UserMediaEntryStatus.DROPPED,
  UserMediaEntryStatus.PLANNING,
];

export const sortFieldLabels: Record<UserMediaEntrySortFields, { asc: string; desc: string }> = {
  [UserMediaEntrySortFields.CREATED_AT]: { asc: 'Date Added ↑', desc: 'Date Added ↓' },
  [UserMediaEntrySortFields.UPDATED_AT]: { asc: 'Last Updated ↑', desc: 'Last Updated ↓' },
  [UserMediaEntrySortFields.TITLE]: { asc: 'Title ↑', desc: 'Title ↓' },
};

export const sortOptions = [
  { value: UserMediaEntrySortFields.CREATED_AT, label: 'Date Added' },
  { value: UserMediaEntrySortFields.UPDATED_AT, label: 'Last Updated' },
  { value: UserMediaEntrySortFields.TITLE, label: 'Title' },
];