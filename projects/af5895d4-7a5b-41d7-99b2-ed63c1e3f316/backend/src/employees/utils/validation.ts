import { Employee } from '../models/Employee';

export function validateEmployee(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.name || typeof data.name !== 'string') errors.push('Name is required.');
  if (!data.role || typeof data.role !== 'string') errors.push('Role is required.');
  if (!data.department || typeof data.department !== 'string') errors.push('Department is required.');
  if (!data.email || typeof data.email !== 'string') errors.push('Email is required.');
  return { valid: errors.length === 0, errors };
}
