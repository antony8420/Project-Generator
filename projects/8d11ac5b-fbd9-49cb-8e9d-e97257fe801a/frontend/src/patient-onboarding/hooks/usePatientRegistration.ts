import { useState } from 'react';
import { Patient } from '../types/Patient';
import { registerPatient as apiRegisterPatient } from '../services/patientService';

export default function usePatientRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  async function registerPatient(form: Partial<Patient>, profilePhoto?: File | null, idDocument?: File | null) {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRegisterPatient(form, profilePhoto, idDocument);
      setPatient(result);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  return { registerPatient, loading, error, patient };
}