// User type
type UserRole = 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
export interface User {
  id: string;
  username: string;
  role: UserRole;
  employeeId?: string;
}
