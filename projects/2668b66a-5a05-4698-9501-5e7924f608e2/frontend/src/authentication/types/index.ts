// Auth types
export type UserRole = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  token: string;
}
