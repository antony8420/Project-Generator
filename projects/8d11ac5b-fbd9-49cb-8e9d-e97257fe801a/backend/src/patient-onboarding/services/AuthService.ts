import fs from 'fs/promises';
import path from 'path';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const USERS_PATH = path.join(__dirname, '../../../data/patient-onboarding/users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users: User[]) {
  await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));
}

export const AuthService = {
  async register(username: string, password: string, role: 'admin' | 'patient' = 'patient'): Promise<User> {
    const users = await readUsers();
    if (users.find(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: uuidv4(),
      username,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    await writeUsers(users);
    return user;
  },
  async authenticate(username: string, password: string): Promise<User | null> {
    const users = await readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    return valid ? user : null;
  },
  async getUserById(id: string): Promise<User | undefined> {
    const users = await readUsers();
    return users.find(u => u.id === id);
  }
};
