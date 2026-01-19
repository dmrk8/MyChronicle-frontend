import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserMediaEntry,
  updateUserMediaEntry,
  deleteUserMediaEntry,
  getUserMediaEntryByExternalId,
  getUserMediaEntriesPaginated,
  type GetUserMediaEntriesParams,
} from "../api/userMediaEntryApi";
import type {
    UserMediaEntryCreate,
    UserMediaEntryUpdate,
} from "../types/UserMediaEntry";

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

export const useGetUserMediaEntryByExternalId = (externalId: number, externalSource: string) => {
  return useQuery({
    queryKey: ["userMediaEntry", "external", externalSource, externalId],
    queryFn: () => getUserMediaEntryByExternalId(externalId, externalSource),
    enabled: !!externalId && externalId > 0 && !!externalSource,
    staleTime: 0, // Always refetch to ensure fresh data
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