export const UserRole = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface UserCreate {
  username: string;
  password: string;
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}