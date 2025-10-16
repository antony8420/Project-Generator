import { Answer } from '../models/Answer';

export function validateAnswer(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.form_instance_id || typeof data.form_instance_id !== 'string') errors.push('FormInstance ID is required.');
  if (!data.control_id || typeof data.control_id !== 'string') errors.push('Control ID is required.');
  if (!data.value || typeof data.value !== 'string') errors.push('Value is required.');
  if (!data.entered_by || typeof data.entered_by !== 'string') errors.push('Entered_by is required.');
  return { valid: errors.length === 0, errors };
}
