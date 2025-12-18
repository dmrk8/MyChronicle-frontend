enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

interface UserDB {
  id?: string;
  username: string;
  hashPassword: string;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
}

interface UserCreate {
  username: string;
  password: string;
}

interface UserUpdateRequest {
  username?: string;
  password?: string;
  updatedAt: string;
}

interface UserUpdate {
  username?: string;
  hashPassword?: string;
  role?: UserRole;
}

interface UserResponse {
  message: string;
  userId?: string;
  data?: any;
  acknowledged?: boolean;
}