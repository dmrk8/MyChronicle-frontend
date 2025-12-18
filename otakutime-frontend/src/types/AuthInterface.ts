interface LoginRequest {
  username: string;
  password: string;
  isRememberMe?: boolean;
}

interface RefreshTokenRequest {
  refreshToken: string;
  userId: string;
}

interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}