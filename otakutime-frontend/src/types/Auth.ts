export interface LoginRequest {
  username: string;
  password: string;
  isRememberMe?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  userId: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface UserInfo {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
