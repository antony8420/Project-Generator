// UserProfile type
export interface UserProfile {
  id: string;
  username: string;
  role: 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  employeeId?: string;
}
