// Auth service
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import fs from 'fs/promises';
import path from 'path';

const USERS_PATH = path.join(__dirname, '../../../data/authentication/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export default {
  login: async (username: string, password: string) => {
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('Invalid credentials');
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user.id, role: user.role, employeeId: user.employeeId }, JWT_SECRET, { expiresIn: '8h' });
    return { token, role: user.role, employeeId: user.employeeId };
  }
};
