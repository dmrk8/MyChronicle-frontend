import backendApi from "./backendApi";
import type {
    ReviewCreate,
    Review,
    ReviewUpdate,
} from "../types/Review";

export const createReview = async (
  review: ReviewCreate
): Promise<Review> => {
  const response = await backendApi.post("/reviews/", review);
  return response.data;
};

export const updateReview = async (
  reviewId: string,
  update: ReviewUpdate
): Promise<Review> => {
  const response = await backendApi.patch(`/reviews/${reviewId}`, update);
  return response.data;
};

export const deleteReview = async (
  reviewId: string
): Promise<boolean> => {
  const response = await backendApi.delete(`/reviews/${reviewId}`);
  return response.data;
};

export const getReviewsByUserMediaEntryId = async (
  userMediaEntryId: string
): Promise<Review[]> => {
  const response = await backendApi.get(`/reviews/entry/${userMediaEntryId}`);
  return response.data;
};

export const getReviewsByUserIdAndMediaId = async (
  mediaId: string
): Promise<Review[]> => {
  const response = await backendApi.get(`/reviews/by-user-id`, {
    params: { media_id: mediaId },
  });
  return response.data;
};