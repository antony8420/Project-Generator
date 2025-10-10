import { EmployeeInput } from '../models/employeeModel';

export function validateEmployee(data: any, isCreate: boolean): { error?: string } {
  const requiredFields = [
    'fullName', 'email', 'phone', 'address',
    'department', 'position', 'salary', 'startDate'
  ];
  for (const field of requiredFields) {
    if (isCreate && !data[field]) {
      return { error: `${field} is required` };
    }
  }
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    return { error: 'Invalid email format' };
  }
  if (data.salary && (typeof data.salary !== 'number' || data.salary < 0)) {
    return { error: 'Salary must be a positive number' };
  }
  return {};
}
