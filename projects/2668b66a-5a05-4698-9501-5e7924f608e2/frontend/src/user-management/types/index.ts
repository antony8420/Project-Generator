// User management types
export type UserRole = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  employeeId?: string;
}
