import { Request } from 'express';
import { Patient } from '../models/Patient';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(__dirname, '../../../data/patient-onboarding/patients.json');
const UPLOADS_PATH = path.join(__dirname, '../../../uploads');

function validateEmail(email: string): boolean {
  // Simple email regex
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  // Accepts digits, spaces, dashes, parentheses, plus
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(phone);
}

function validateDOB(dob: string): boolean {
  // ISO date format and must be in the past
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const date = new Date(dob);
  return date instanceof Date && !isNaN(date.getTime()) && date < new Date();
}

function validateGender(gender: string): boolean {
  return ['Male', 'Female', 'Other'].includes(gender);
}

function validatePatientFields(fields: Partial<Patient>): string | null {
  if (!fields.firstName || fields.firstName.trim().length < 2) return 'First name must be at least 2 characters.';
  if (!fields.lastName || fields.lastName.trim().length < 2) return 'Last name must be at least 2 characters.';
  if (!fields.email || !validateEmail(fields.email)) return 'Invalid email format.';
  if (!fields.phone || !validatePhone(fields.phone)) return 'Invalid phone format.';
  if (!fields.gender || !validateGender(fields.gender)) return 'Invalid gender.';
  if (!fields.dob || !validateDOB(fields.dob)) return 'Invalid date of birth.';
  if (!fields.address || fields.address.trim().length < 5) return 'Address must be at least 5 characters.';
  return null;
}

async function readPatients(): Promise<Patient[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePatients(patients: Patient[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(patients, null, 2));
}

export const PatientService = {
  async registerPatient(req: Request): Promise<Patient> {
    const { firstName, lastName, email, phone, gender, dob, address } = req.body;
    const validationError = validatePatientFields({ firstName, lastName, email, phone, gender, dob, address });
    if (validationError) {
      throw new Error(validationError);
    }
    const patients = await readPatients();
    if (patients.find(p => p.email === email)) {
      throw new Error('Email already exists');
    }
    if (patients.find(p => p.phone === phone)) {
      throw new Error('Phone already exists');
    }
    const id = uuidv4();
    let profilePhotoUrl, idDocumentUrl;
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.profilePhoto && files.profilePhoto[0]) {
        profilePhotoUrl = `/uploads/${files.profilePhoto[0].filename}`;
      }
      if (files.idDocument && files.idDocument[0]) {
        idDocumentUrl = `/uploads/${files.idDocument[0].filename}`;
      }
    }
    const patient: Patient = {
      id,
      firstName,
      lastName,
      email,
      phone,
      gender,
      dob,
      address,
      profilePhotoUrl,
      idDocumentUrl,
      createdAt: new Date().toISOString()
    };
    patients.push(patient);
    await writePatients(patients);
    return patient;
  }
};
