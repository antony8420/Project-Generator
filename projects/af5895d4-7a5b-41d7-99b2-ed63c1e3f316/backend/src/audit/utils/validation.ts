import { AuditLog } from '../models/AuditLog';

export function validateAuditLog(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.entity || typeof data.entity !== 'string') errors.push('Entity is required.');
  if (!data.operation || typeof data.operation !== 'string') errors.push('Operation is required.');
  if (!data.user || typeof data.user !== 'string') errors.push('User is required.');
  if (!data.details || typeof data.details !== 'string') errors.push('Details are required.');
  return { valid: errors.length === 0, errors };
}
