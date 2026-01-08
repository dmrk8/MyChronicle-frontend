import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
          queryKey: ["userMediaEntry", "external", data.externalId] 
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
          queryKey: ["userMediaEntry", "external", data.externalId] 
        });
    },
  });
};

export const useDeleteUserMediaEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId }: { entryId: string; externalId?: number }) => 
      deleteUserMediaEntry(entryId),
    onSuccess: (_data, variables) => {
        queryClient.removeQueries({ 
          queryKey: ["userMediaEntry", "external", variables.externalId] 
        });
    },
  });
};


export const useGetUserMediaEntryByExternalId = (externalId: number) => {
  return useQuery({
    queryKey: ["userMediaEntry", "external", externalId],
    queryFn: () => getUserMediaEntryByExternalId(externalId),
    enabled: !!externalId && externalId > 0,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true,
  });
};

export const useGetUserMediaEntriesPaginated = (
  params: GetUserMediaEntriesParams
) => {
  return useQuery({
    queryKey: ["userMediaEntries", "paginated", params],
    queryFn: () => getUserMediaEntriesPaginated(params),
  });
};