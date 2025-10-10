import { Employee } from '../models/Employee';

export function validateEmployee(data: Partial<Employee>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.fullName || data.fullName.trim() === '') errors.push('Full Name is required');
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push('Valid Email is required');
  if (!data.phone || data.phone.trim() === '') errors.push('Phone is required');
  if (!data.address || data.address.trim() === '') errors.push('Address is required');
  if (!data.department || data.department.trim() === '') errors.push('Department is required');
  if (!data.position || data.position.trim() === '') errors.push('Position is required');
  if (typeof data.salary !== 'number' || data.salary <= 0) errors.push('Salary must be a positive number');
  if (!data.startDate || isNaN(Date.parse(data.startDate))) errors.push('Valid Start Date is required');
  return { valid: errors.length === 0, errors };
}
