import backendApi from "./backendApi";
import type {
    UserMediaEntryCreate,
    UserMediaEntryUpdate,
    UserMediaEntryPagination,
    UserMediaEntry,
    UserMediaEntrySortFields,
    UserMediaEntrySortOptions,
    UserMediaEntrySyncMetadata,
} from "../types/UserMediaEntry";
import type { Review, ReviewUpdate } from "../types/Review";

export const createUserMediaEntry = async (
  entry: UserMediaEntryCreate
): Promise<UserMediaEntry> => {
  const response = await backendApi.post("/user-media-entries/", entry);
  return response.data;
};

export const getUserMediaEntryById = async (
  entryId: string
): Promise<UserMediaEntry> => {
  const response = await backendApi.get(`/user-media-entries/${entryId}`);
  return response.data;
};

export const updateUserMediaEntry = async (
  entryId: string,
  update: UserMediaEntryUpdate
): Promise<UserMediaEntry> => {
  const response = await backendApi.patch(`/user-media-entries/${entryId}`, update);
  return response.data;
};

export const deleteUserMediaEntry = async (
  entryId: string
): Promise<void> => {
  await backendApi.delete(`/user-media-entries/${entryId}`);
};

export const getUserMediaEntryByExternalId = async (
  externalId: number,
  externalSource: string
): Promise<UserMediaEntry> => {
  const response = await backendApi.get(
    `/user-media-entries/by-external/${externalSource}/${externalId}`
  );
  return response.data;
};

export interface GetUserMediaEntriesParams {
  page?: number;
  perPage?: number;
  sortBy?: UserMediaEntrySortFields;
  sortOrder?: UserMediaEntrySortOptions;
  inLibrary?: boolean;
  isFavorite?: boolean;
  status?: string;
  mediaType?: string;
  titleSearch?: string;
  isAdult?: boolean;
}

export const getUserMediaEntriesPaginated = async (
  params: GetUserMediaEntriesParams
): Promise<UserMediaEntryPagination> => {
  const response = await backendApi.get("/user-media-entries/", { params });
  return response.data;
};



export const syncUserMediaEntryMetadata = async (
  entryId: string,
  metadata: UserMediaEntrySyncMetadata
): Promise<UserMediaEntry> => {
  const response = await backendApi.patch(
    `/user-media-entries/${entryId}/metadata`,
    metadata
  );
  return response.data;
};

// Review endpoints
export const createReviewForUserMediaEntry = async (
  entryId: string,
  review: ReviewUpdate
): Promise<Review> => {
  const response = await backendApi.post(
    `/user-media-entries/${entryId}/reviews`,
    review
  );
  return response.data;
};

export const getReviewsForUserMediaEntry = async (
  entryId: string
): Promise<Review[]> => {
  const response = await backendApi.get(
    `/user-media-entries/${entryId}/reviews`
  );
  return response.data;
};

export const countReviewsForUserMediaEntry = async (
  entryId: string
): Promise<number> => {
  const response = await backendApi.get(
    `/user-media-entries/${entryId}/reviews/count`
  );
  return response.data;
};

export const getReviewById = async (
  entryId: string,
  reviewId: string
): Promise<Review> => {
  const response = await backendApi.get(
    `/user-media-entries/${entryId}/reviews/${reviewId}`
  );
  return response.data;
};

export const updateReviewForUserMediaEntry = async (
  entryId: string,
  reviewId: string,
  update: ReviewUpdate
): Promise<Review> => {
  const response = await backendApi.patch(
    `/user-media-entries/${entryId}/reviews/${reviewId}`,
    update
  );
  return response.data;
};

export const deleteReviewForUserMediaEntry = async (
  entryId: string,
  reviewId: string
): Promise<void> => {
  await backendApi.delete(
    `/user-media-entries/${entryId}/reviews/${reviewId}`
  );
};

export const deleteReviewsForUserMediaEntry = async (
  entryId: string
): Promise<void> => {
  await backendApi.delete(`/user-media-entries/${entryId}/reviews`);
};