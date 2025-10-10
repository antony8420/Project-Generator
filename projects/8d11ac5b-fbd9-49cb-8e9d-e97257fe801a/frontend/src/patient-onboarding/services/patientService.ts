import axios from 'axios';
import { Patient } from '../types/Patient';

export async function registerPatient(form: Partial<Patient>, profilePhoto?: File | null, idDocument?: File | null): Promise<Patient> {
  const data = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      data.append(key, value as string);
    }
  });
  if (profilePhoto) data.append('profilePhoto', profilePhoto);
  if (idDocument) data.append('idDocument', idDocument);
  const res = await axios.post('/api/patients', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}