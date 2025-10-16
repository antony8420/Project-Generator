import { CNCRMapping } from '../models/CNCRMapping';

export function validateCNCRMapping(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.document_title || typeof data.document_title !== 'string') errors.push('Document title is required.');
  if (!data.loinc_code || typeof data.loinc_code !== 'string') errors.push('LOINC code is required.');
  if (typeof data.exclude_from_ccda !== 'boolean') errors.push('Exclude_from_ccda must be boolean.');
  return { valid: errors.length === 0, errors };
}
