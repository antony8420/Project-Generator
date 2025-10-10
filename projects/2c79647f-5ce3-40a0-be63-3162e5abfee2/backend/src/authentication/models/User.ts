// User model for authentication
export type UserRole = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  employeeId?: string; // Link to employee profile if applicable
}
