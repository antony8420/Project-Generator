import { Request, Response } from 'express';
import { PatientService } from '../services/PatientService';
import { logInfo, logError } from '../utils/logger';

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const patient = await PatientService.registerPatient(req);
    logInfo('Patient registered', { patientId: patient.id, email: patient.email });
    res.status(201).json(patient);
  } catch (err: any) {
    logError('Patient registration error', { error: err.message, body: req.body });
    res.status(400).json({ error: err.message });
  }
};