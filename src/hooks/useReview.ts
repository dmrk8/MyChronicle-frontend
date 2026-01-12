import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByUserMediaEntryId,
  getReviewsByUserIdAndMediaId,
} from "../api/reviewApi";
import type {
    ReviewCreate,
    ReviewUpdate,
} from "../types/Review";

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (review: ReviewCreate) => createReview(review),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["review", data.id] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.userMediaEntryId] });
    },
  });
};


export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      update,
    }: {
      reviewId: string;
      update: ReviewUpdate;
    }) => updateReview(reviewId, update),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["review", data.id] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.userMediaEntryId] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }: { reviewId: string; userMediaEntryId: string }) => deleteReview(reviewId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["review", variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.userMediaEntryId] });
    },
  });
};

export const useGetReviewsByUserMediaEntryId = (userMediaEntryId: string) => {
  return useQuery({
    queryKey: ["reviews", userMediaEntryId],
    queryFn: () => getReviewsByUserMediaEntryId(userMediaEntryId),
    enabled: !!userMediaEntryId,
  });
};

export const useGetReviewsByUserIdAndMediaId = (mediaId: string) => {
  return useQuery({
    queryKey: ["reviews", "by-media", mediaId],
    queryFn: () => getReviewsByUserIdAndMediaId(mediaId),
    enabled: !!mediaId,
  });
};