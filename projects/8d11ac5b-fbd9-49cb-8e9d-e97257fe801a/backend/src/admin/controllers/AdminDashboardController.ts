import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const PATIENTS_PATH = path.join(__dirname, '../../../data/patient-onboarding/patients.json');

async function readPatients() {
  try {
    const data = await fs.readFile(PATIENTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const patients = await readPatients();
    const total = patients.length;
    const verified = patients.filter((p: any) => p.verified === true).length;
    const pending = patients.filter((p: any) => !p.verified).length;
    const inactive = patients.filter((p: any) => p.isActive === false).length;
    const now = new Date();
    const daily = patients.filter((p: any) => {
      const created = new Date(p.createdAt);
      return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000;
    }).length;
    res.json({ total, verified, pending, inactive, daily });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
