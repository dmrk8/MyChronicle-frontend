type ReviewMediaType = string;
type ReviewMediaSource = string;
type ReviewStatus = string;

interface UserMediaEntryCreate {
  externalId: number;
  externalSource: ReviewMediaSource;
  mediaType: ReviewMediaType;
  status: ReviewStatus;
  repeatCount?: number;
  isFavorite: boolean;
  inLibrary: boolean;
}

interface UserMediaEntryDB extends UserMediaEntryCreate {
  id?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface UserMediaEntryUpdate {
  status?: ReviewStatus;
  repeatCount?: number;
  isFavorite?: boolean;
  inLibrary?: boolean;
  updatedAt?: string;
}

interface UserMediaEntryResponse {
  message: string;
  userMediaEntryId?: string;
  userId?: string;
  data?: UserMediaEntryDB | UserMediaEntryDB[];
  acknowledged?: boolean;
}

interface UserMediaEntryPagination {
  results: UserMediaEntryDB[];
  page: number;
  perPage: number;
  hasNextPage: boolean;
  total: number;
}