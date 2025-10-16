import { Reflex } from '../models/Reflex';

export function validateReflex(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.code || typeof data.code !== 'string') errors.push('Code is required.');
  if (!data.description || typeof data.description !== 'string') errors.push('Description is required.');
  if (!Array.isArray(data.responses)) errors.push('Responses must be an array.');
  return { valid: errors.length === 0, errors };
}
