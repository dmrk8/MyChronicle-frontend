import backendApi from "./backendApi";
import type {
    ReviewCreate,
    Review,
    ReviewUpdate,
} from "../types/Review";

export const createReview = async (
  review: ReviewCreate
): Promise<Review> => {
  const response = await backendApi.post("/review/", review);
  return response.data;
};

export const updateReview = async (
  reviewId: string,
  update: ReviewUpdate
): Promise<Review> => {
  const response = await backendApi.patch(`/review/${reviewId}`, update);
  return response.data;
};

export const deleteReview = async (
  reviewId: string
): Promise<boolean> => {
  const response = await backendApi.delete(`/review/${reviewId}`);
  return response.data;
};

export const getReviewsByUserMediaEntryId = async (
  userMediaEntryId: string
): Promise<Review[]> => {
  const response = await backendApi.get(`/review/entry/${userMediaEntryId}`);
  return response.data;
};

export const getReviewsByUserIdAndMediaId = async (
  mediaId: string
): Promise<Review[]> => {
  const response = await backendApi.get(`/review/by-user-id`, {
    params: { media_id: mediaId },
  });
  return response.data;
};