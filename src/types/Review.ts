export interface ReviewCreate extends ReviewUpdate{
  userMediaEntryId: string;
}

export interface Review extends ReviewCreate {
  id: string; 
  createdAt: string;
  updatedAt: string;
}

export interface ReviewUpdate {
  review?: string;
  rating?: number;
  reviewProgress?: number;
  writtenAt?: string;
}


export type ReviewDeleteResponse = { success: boolean };