import backendApi from "./backendApi";
import type {
    UserMediaEntryCreate,
    UserMediaEntryUpdate,
    UserMediaEntryResponse,
    UserMediaEntryPagination,
} from "../types/UserMediaEntry";

export const createUserMediaEntry = async (
  entry: UserMediaEntryCreate
): Promise<UserMediaEntryResponse> => {
  const response = await backendApi.post("/user-media-entry/", entry);
  return response.data;
};

export const getUserMediaEntryById = async (
  entryId: string
): Promise<UserMediaEntryResponse> => {
  const response = await backendApi.get(`/user-media-entry/${entryId}`);
  return response.data;
};

export const updateUserMediaEntry = async (
  entryId: string,
  update: UserMediaEntryUpdate
): Promise<UserMediaEntryResponse> => {
  const response = await backendApi.patch(`/user-media-entry/${entryId}`, update);
  return response.data;
};

export const deleteUserMediaEntry = async (
  entryId: string
): Promise<UserMediaEntryResponse> => {
  const response = await backendApi.delete(`/user-media-entry/${entryId}`);
  return response.data;
};

export const getUserMediaEntries = async (): Promise<UserMediaEntryResponse> => {
  const response = await backendApi.get("/user-media-entry/by-user/");
  return response.data;
};

export const getUserMediaEntryByExternalId = async (
  externalId: number
): Promise<UserMediaEntryResponse> => {
  const response = await backendApi.get(
    `/user-media-entry/by-external/${externalId}`
  );
  return response.data;
};

export interface GetUserMediaEntriesParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: number;
  inLibrary?: boolean;
  isFavorite?: boolean;
  status?: string;
  mediaType?: string;
}

export const getUserMediaEntriesPaginated = async (
  params: GetUserMediaEntriesParams
): Promise<UserMediaEntryPagination> => {
  const response = await backendApi.get("/user-media-entry/", { params });
  return response.data;
};