import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserMediaEntry,
  updateUserMediaEntry,
  deleteUserMediaEntry,
  getUserMediaEntryByExternalId,
  getUserMediaEntriesPaginated,
  createReviewForUserMediaEntry,
  getReviewsForUserMediaEntry,
  countReviewsForUserMediaEntry,
  getReviewById,
  updateReviewForUserMediaEntry,
  deleteReviewForUserMediaEntry,
  deleteReviewsForUserMediaEntry,
  type GetUserMediaEntriesParams,
  syncUserMediaEntryMetadata,
} from "../api/userMediaEntryApi";
import type {
    UserMediaEntryCreate,
    UserMediaEntrySyncMetadata,
    UserMediaEntryUpdate,
} from "../types/UserMediaEntry";
import type { ReviewUpdate } from "../types/Review";

export const useCreateUserMediaEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: UserMediaEntryCreate) => createUserMediaEntry(entry),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
          queryKey: ["userMediaEntry", "external", data.externalSource, data.externalId] 
        });
    },
  });
};

export const useUpdateUserMediaEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      update,
    }: {
      entryId: string;
      update: UserMediaEntryUpdate;
    }) => updateUserMediaEntry(entryId, update),
    onSuccess: (data) => {
        queryClient.invalidateQueries({ 
          queryKey: ["userMediaEntry", "external", data.externalSource, data.externalId] 
        });
    },
  });
};

export const useDeleteUserMediaEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; externalId?: number; externalSource?: string }) => 
      deleteUserMediaEntry(entryId),
    onSuccess: (_data, variables) => {
        queryClient.removeQueries({ 
          queryKey: ["userMediaEntry", "external", variables.externalSource, variables.externalId] 
        });
    },
  });
};

export const useGetUserMediaEntryByExternalId = (
  externalId: number | undefined, 
  externalSource: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["userMediaEntry", "external", externalSource, externalId],
    queryFn: () => getUserMediaEntryByExternalId(externalId!, externalSource),
    enabled: (options?.enabled ?? true) && !!externalId && externalId > 0 && !!externalSource,
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useGetUserMediaEntriesPaginated = (
  params: GetUserMediaEntriesParams
) => {
  return useInfiniteQuery({
    queryKey: ["userMediaEntries", "paginated", params],
    queryFn: ({ pageParam = 1 }) => 
      getUserMediaEntriesPaginated({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
       return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
};


export const useSyncUserMediaEntryMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      metadata,
    }: {
      entryId: string;
      metadata: UserMediaEntrySyncMetadata;
    }) => syncUserMediaEntryMetadata(entryId, metadata),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userMediaEntry", "external", data.externalSource, data.externalId],
      });
    },
  });
};

// Review hooks
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, review }: { entryId: string; review: ReviewUpdate }) =>
      createReviewForUserMediaEntry(entryId, review),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["reviews", data.userMediaEntryId] 
      });
    },
  });
};

export const useGetReviewsForEntry = (entryId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["reviews", entryId],
    queryFn: () => getReviewsForUserMediaEntry(entryId),
    enabled: (options?.enabled ?? true) && !!entryId,
  });
};

export const useCountReviewsForEntry = (entryId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["reviewsCount", entryId],
    queryFn: () => countReviewsForUserMediaEntry(entryId),
    enabled: (options?.enabled ?? true) && !!entryId,
  });
};

export const useGetReviewById = (entryId: string, reviewId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["review", entryId, reviewId],
    queryFn: () => getReviewById(entryId, reviewId),
    enabled: (options?.enabled ?? true) && !!entryId && !!reviewId,
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, reviewId, update }: { entryId: string; reviewId: string; update: ReviewUpdate }) =>
      updateReviewForUserMediaEntry(entryId, reviewId, update),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["reviews", data.userMediaEntryId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["review", data.userMediaEntryId, data.id] 
      });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, reviewId }: { entryId: string; reviewId: string }) =>
      deleteReviewForUserMediaEntry(entryId, reviewId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["reviews", variables.entryId] 
      });
    },
  });
};

export const useDeleteReviewsForEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => deleteReviewsForUserMediaEntry(entryId),
    onSuccess: (_data, entryId) => {
      queryClient.invalidateQueries({ 
        queryKey: ["reviews", entryId] 
      });
    },
  });
};