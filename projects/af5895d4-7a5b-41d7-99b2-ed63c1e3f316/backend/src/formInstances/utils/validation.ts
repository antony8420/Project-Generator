import { FormInstance } from '../models/FormInstance';

export function validateFormInstance(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.template_id || typeof data.template_id !== 'string') errors.push('Template ID is required.');
  if (!data.patient_id || typeof data.patient_id !== 'string') errors.push('Patient ID is required.');
  if (!data.encounter_id || typeof data.encounter_id !== 'string') errors.push('Encounter ID is required.');
  if (!data.created_by || typeof data.created_by !== 'string') errors.push('Created_by is required.');
  return { valid: errors.length === 0, errors };
}
