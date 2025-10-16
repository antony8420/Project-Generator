import { Employee } from '../types/Employee';

export function validateEmployee(data: Partial<Employee>): string[] {
  const errors: string[] = [];
  if (!data.name) errors.push('Name is required.');
  if (!data.role) errors.push('Role is required.');
  if (!data.department) errors.push('Department is required.');
  if (!data.email) errors.push('Email is required.');
  return errors;
}
