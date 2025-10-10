import fs from 'fs/promises';
import path from 'path';
import { Admin } from '../models/Admin';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const ADMINS_PATH = path.join(__dirname, '../../../data/admin/admins.json');

async function readAdmins(): Promise<Admin[]> {
  try {
    const data = await fs.readFile(ADMINS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeAdmins(admins: Admin[]) {
  await fs.writeFile(ADMINS_PATH, JSON.stringify(admins, null, 2));
}

export const AdminService = {
  async register(name: string, email: string, password: string, role: 'SuperAdmin' | 'Staff' = 'Staff'): Promise<Admin> {
    const admins = await readAdmins();
    if (admins.find(a => a.email === email)) {
      throw new Error('Email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin: Admin = {
      adminId: 'ADM-' + (admins.length + 1).toString().padStart(4, '0'),
      name,
      email,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };
    admins.push(admin);
    await writeAdmins(admins);
    return admin;
  },
  async authenticate(email: string, password: string): Promise<Admin | null> {
    const admins = await readAdmins();
    const admin = admins.find(a => a.email === email && a.isActive);
    if (!admin) return null;
    const valid = await bcrypt.compare(password, admin.passwordHash);
    return valid ? admin : null;
  },
  async getAdminById(adminId: string): Promise<Admin | undefined> {
    const admins = await readAdmins();
    return admins.find(a => a.adminId === adminId);
  },
  async updateLastLogin(adminId: string) {
    const admins = await readAdmins();
    const admin = admins.find(a => a.adminId === adminId);
    if (admin) {
      admin.lastLogin = new Date().toISOString();
      await writeAdmins(admins);
    }
  },
  async setActiveStatus(adminId: string, isActive: boolean) {
    const admins = await readAdmins();
    const admin = admins.find(a => a.adminId === adminId);
    if (admin) {
      admin.isActive = isActive;
      await writeAdmins(admins);
    }
  }
};
