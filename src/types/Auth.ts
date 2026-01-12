export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
