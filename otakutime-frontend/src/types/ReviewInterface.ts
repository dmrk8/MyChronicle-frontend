interface ReviewCreate {
  userMediaEntryId: string;
  review?: string;
  rating?: number;
  reviewProgress?: number;
  writtenAt?: string;
}

interface ReviewDB extends ReviewCreate {
  id?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewUpdate {
  review?: string;
  rating?: number;
  reviewProgress?: number;
  writtenAt?: string;
}

interface ReviewResponse {
  message: string;
  reviewId?: string;
  userMediaEntryId?: string;
  acknowledged?: boolean;
  data?: ReviewDB | ReviewDB[];
}