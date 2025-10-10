import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { AuditLogService } from '../services/AuditLogService';

const PATIENTS_PATH = path.join(__dirname, '../../../data/patient-onboarding/patients.json');

async function readPatients() {
  try {
    const data = await fs.readFile(PATIENTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePatients(patients: any[]) {
  await fs.writeFile(PATIENTS_PATH, JSON.stringify(patients, null, 2));
}

export const getPatients = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    let patients = await readPatients();
    // Filtering
    if (status) {
      if (status === 'verified') patients = patients.filter((p: any) => p.verified === true);
      else if (status === 'unverified') patients = patients.filter((p: any) => !p.verified);
      else if (status === 'active') patients = patients.filter((p: any) => p.isActive !== false);
      else if (status === 'inactive') patients = patients.filter((p: any) => p.isActive === false);
    }
    // Search
    if (search) {
      const s = (search as string).toLowerCase();
      patients = patients.filter((p: any) =>
        p.firstName?.toLowerCase().includes(s) ||
        p.lastName?.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.phone?.toLowerCase().includes(s) ||
        p.id?.toLowerCase().includes(s)
      );
    }
    // Pagination
    const total = patients.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = patients.slice(start, start + Number(limit));
    res.json({ data: paginated, total });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getPatientDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patients = await readPatients();
    const patient = patients.find((p: any) => p.id === id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyPatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patients = await readPatients();
    const patient = patients.find((p: any) => p.id === id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    patient.verified = true;
    await writePatients(patients);
    await AuditLogService.logAction(req.admin.adminId, 'VERIFY_PATIENT', id, 'Patient verified');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deactivatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patients = await readPatients();
    const patient = patients.find((p: any) => p.id === id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    patient.isActive = false;
    await writePatients(patients);
    await AuditLogService.logAction(req.admin.adminId, 'DEACTIVATE_PATIENT', id, 'Patient deactivated');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const activatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patients = await readPatients();
    const patient = patients.find((p: any) => p.id === id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    patient.isActive = true;
    await writePatients(patients);
    await AuditLogService.logAction(req.admin.adminId, 'ACTIVATE_PATIENT', id, 'Patient reactivated');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
