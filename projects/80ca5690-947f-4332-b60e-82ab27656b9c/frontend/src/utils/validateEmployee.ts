import { Employee } from '../types/Employee';

export function validateEmployee(data: Partial<Employee>): string | null {
  if (!data.fullName || !data.email || !data.phone || !data.address || !data.department || !data.position || !data.salary || !data.startDate) {
    return 'All fields are required.';
  }
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(data.email)) {
    return 'Invalid email format.';
  }
  if (isNaN(Number(data.salary)) || Number(data.salary) <= 0) {
    return 'Salary must be a positive number.';
  }
  return null;
}
