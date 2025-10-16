import { FormTemplate } from '../models/FormTemplate';

export function validateFormTemplate(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.code || typeof data.code !== 'string' || data.code.length > 5) errors.push('Code is required and <=5 chars.');
  if (!data.title || typeof data.title !== 'string') errors.push('Title is required.');
  if (!data.status || !['Under Construction', 'Live', 'Obsolete'].includes(data.status)) errors.push('Invalid status.');
  if (!data.created_by || typeof data.created_by !== 'string') errors.push('Created_by is required.');
  return { valid: errors.length === 0, errors };
}
