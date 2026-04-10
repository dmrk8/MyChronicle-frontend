export const UserRole = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface UpdatePassword {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}