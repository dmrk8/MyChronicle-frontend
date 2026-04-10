
export interface ReviewUpdate {
  review?: string;
  rating?: number;
  reviewProgress?: number;
  writtenAt?: string;
}


export interface Review  {
  id: string;
  userMediaEntryId: string;
  userId: string;

  review?: string;
  rating?: number;
  reviewProgress?: number;
  writtenAt?: string;

  createdAt: string;
  updatedAt: string;
}


