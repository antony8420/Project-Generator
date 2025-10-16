import { Signature } from '../models/Signature';

export function validateSignature(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (!data.form_instance_id || typeof data.form_instance_id !== 'string') errors.push('FormInstance ID is required.');
  if (!data.signer_id || typeof data.signer_id !== 'string') errors.push('Signer ID is required.');
  if (!data.signature_blob || typeof data.signature_blob !== 'string') errors.push('Signature blob is required.');
  if (!data.method || typeof data.method !== 'string') errors.push('Method is required.');
  return { valid: errors.length === 0, errors };
}
